import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { ComplianceAlert, ComplianceReport } from '../../types/compliance';
import { complianceService } from '../../services/complianceService';

interface AlertStatistics {
    critical: number;
    warning: number;
    info: number;
}

interface ValidationStatistics {
    total: number;
    passed: number;
    failed: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ComplianceStatistics: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [alertHistory, setAlertHistory] = useState<ComplianceAlert[]>([]);
    const [alertStats, setAlertStats] = useState<AlertStatistics>({
        critical: 0,
        warning: 0,
        info: 0
    });
    const [validationStats, setValidationStats] = useState<ValidationStatistics>({
        total: 0,
        passed: 0,
        failed: 0
    });

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const alerts = await complianceService.getAlertHistory();
            setAlertHistory(alerts);

            // Alert-Statistiken berechnen
            const stats = alerts.reduce(
                (acc, alert) => {
                    if (alert.schweregrad >= 3) acc.critical++;
                    else if (alert.schweregrad === 2) acc.warning++;
                    else acc.info++;
                    return acc;
                },
                { critical: 0, warning: 0, info: 0 }
            );
            setAlertStats(stats);

            // Validierungs-Statistiken berechnen
            // In einer realen Anwendung würden diese Daten vom Backend kommen
            setValidationStats({
                total: 100,
                passed: 85,
                failed: 15
            });
        } catch (error) {
            console.error('Fehler beim Laden der Statistiken:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const alertPieData = [
        { name: 'Kritisch', value: alertStats.critical },
        { name: 'Warnung', value: alertStats.warning },
        { name: 'Info', value: alertStats.info }
    ];

    const validationBarData = [
        { name: 'Gesamt', value: validationStats.total },
        { name: 'Bestanden', value: validationStats.passed },
        { name: 'Fehlgeschlagen', value: validationStats.failed }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Compliance Statistiken
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Übersichtskarten */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Gesamtvalidierungen
                                    </Typography>
                                    <Typography variant="h3">
                                        {validationStats.total}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Erfolgsrate
                                    </Typography>
                                    <Typography variant="h3">
                                        {((validationStats.passed / validationStats.total) * 100).toFixed(1)}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Aktive Alerts
                                    </Typography>
                                    <Typography variant="h3">
                                        {alertStats.critical + alertStats.warning}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Alert-Verteilung */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Alert-Verteilung
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={alertPieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {alertPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>

                    {/* Validierungs-Statistiken */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Validierungs-Statistiken
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={validationBarData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default ComplianceStatistics; 