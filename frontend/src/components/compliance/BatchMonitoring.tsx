import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Alert,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ComplianceAlert, MonitoringStatus, ParameterStatistics } from '../../types/compliance';
import { complianceService } from '../../services/complianceService';

const BatchMonitoring: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null);
    const [activeAlerts, setActiveAlerts] = useState<ComplianceAlert[]>([]);
    const [statistics, setStatistics] = useState<Record<string, ParameterStatistics>>({});
    const [selectedParameter, setSelectedParameter] = useState<string | null>(null);

    const fetchMonitoringData = async () => {
        try {
            setLoading(true);
            const status = await complianceService.getMonitoringStatus();
            const alerts = await complianceService.getActiveAlerts();
            
            setMonitoringStatus(status);
            setActiveAlerts(alerts);

            // Statistiken für alle aktiven Parameter abrufen
            const statsPromises = status.active_parameters.map(async (param) => {
                const paramStats = await complianceService.getParameterStatistics(param);
                return [param, paramStats] as [string, ParameterStatistics];
            });

            const statsResults = await Promise.all(statsPromises);
            setStatistics(Object.fromEntries(statsResults));
        } catch (error) {
            console.error('Fehler beim Laden der Monitoring-Daten:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitoringData();
        const interval = setInterval(fetchMonitoringData, 5000); // Alle 5 Sekunden aktualisieren
        return () => clearInterval(interval);
    }, []);

    const handleClearAlert = async (alertKey: string) => {
        try {
            await complianceService.clearAlert(alertKey);
            fetchMonitoringData();
        } catch (error) {
            console.error('Fehler beim Löschen des Alerts:', error);
        }
    };

    const handleStartMonitoring = async (parameterName: string) => {
        try {
            await complianceService.startParameterMonitoring(parameterName);
            fetchMonitoringData();
        } catch (error) {
            console.error('Fehler beim Starten des Monitorings:', error);
        }
    };

    const handleStopMonitoring = async () => {
        try {
            await complianceService.stopMonitoring();
            fetchMonitoringData();
        } catch (error) {
            console.error('Fehler beim Stoppen des Monitorings:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Echtzeit-Monitoring
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Monitoring Status */}
            {monitoringStatus && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Monitoring Status
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Typography variant="body1">
                                Aktive Parameter: {monitoringStatus.active_parameters.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="body1">
                                Aktive Alerts: {monitoringStatus.active_alerts_count}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="body1">
                                Monitoring Tasks: {monitoringStatus.monitoring_tasks}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleStopMonitoring}
                                disabled={monitoringStatus.monitoring_tasks === 0}
                            >
                                Monitoring stoppen
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Aktive Alerts */}
            {activeAlerts.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Aktive Alerts
                    </Typography>
                    <Grid container spacing={2}>
                        {activeAlerts.map((alert, index) => (
                            <Grid item xs={12} key={index}>
                                <Alert
                                    severity={alert.schweregrad >= 3 ? 'error' : 'warning'}
                                    onClose={() => handleClearAlert(`${alert.alert_typ}_${alert.parameter?.name || 'system'}`)}
                                >
                                    {alert.beschreibung}
                                </Alert>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}

            {/* Parameter Statistiken */}
            {Object.keys(statistics).length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Parameter Statistiken
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell align="right">Minimum</TableCell>
                                    <TableCell align="right">Maximum</TableCell>
                                    <TableCell align="right">Durchschnitt</TableCell>
                                    <TableCell align="right">Anzahl Messungen</TableCell>
                                    <TableCell align="right">Letzte Aktualisierung</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(statistics).map(([param, stats]) => (
                                    <TableRow
                                        key={param}
                                        hover
                                        onClick={() => setSelectedParameter(param)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{param}</TableCell>
                                        <TableCell align="right">{stats.min.toFixed(2)}</TableCell>
                                        <TableCell align="right">{stats.max.toFixed(2)}</TableCell>
                                        <TableCell align="right">{stats.avg.toFixed(2)}</TableCell>
                                        <TableCell align="right">{stats.count}</TableCell>
                                        <TableCell align="right">
                                            {new Date(stats.last_update).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Parameter Visualisierung */}
            {selectedParameter && statistics[selectedParameter] && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Parameter Verlauf: {selectedParameter}
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={[
                                    {
                                        name: 'Min',
                                        wert: statistics[selectedParameter].min
                                    },
                                    {
                                        name: 'Durchschnitt',
                                        wert: statistics[selectedParameter].avg
                                    },
                                    {
                                        name: 'Max',
                                        wert: statistics[selectedParameter].max
                                    }
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="wert"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default BatchMonitoring; 