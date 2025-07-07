/**
 * VALEO-NeuroERP VAN Phase Manager Component
 */
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useInterval } from '../hooks/useInterval';

interface VANState {
    cycle_id: string;
    stage: string;
    status: string;
    vision_data: Record<string, any>;
    analysis_data: Record<string, any>;
    next_steps_data: Record<string, any>;
    metadata: Record<string, any>;
    error?: string;
}

const VANPhaseManager: React.FC = () => {
    const theme = useTheme();
    
    // State
    const [cycles, setCycles] = useState<VANState[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cycleId, setCycleId] = useState('');
    
    // Zyklen abrufen
    const fetchCycles = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/v1/van/cycles');
            if (!response.ok) {
                throw new Error('Failed to fetch VAN cycles');
            }
            
            const data = await response.json();
            setCycles(data);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };
    
    // Zyklus starten
    const startCycle = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/v1/van/cycles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cycle_id: cycleId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to start VAN cycle');
            }
            
            await fetchCycles();
            setCycleId('');
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };
    
    // Automatisches Aktualisieren
    useInterval(() => {
        fetchCycles();
    }, 5000);
    
    // Initial laden
    useEffect(() => {
        fetchCycles();
    }, []);
    
    // Stage-Farben
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'vision':
                return theme.palette.primary.main;
            case 'analysis':
                return theme.palette.secondary.main;
            case 'next_steps':
                return theme.palette.info.main;
            default:
                return theme.palette.grey[500];
        }
    };
    
    // Status-Chip
    const StatusChip: React.FC<{ status: string }> = ({ status }) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
        
        switch (status) {
            case 'running':
                color = 'primary';
                break;
            case 'completed':
                color = 'success';
                break;
            case 'error':
                color = 'error';
                break;
            case 'waiting':
                color = 'warning';
                break;
            default:
                color = 'default';
        }
        
        return (
            <Chip
                label={status}
                color={color}
                size="small"
            />
        );
    };
    
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    VAN Phase Manager
                </Typography>
                
                {/* Steuerung */}
                <Paper sx={{ p: 2, mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Zyklus ID"
                                value={cycleId}
                                onChange={(e) => setCycleId(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<StartIcon />}
                                onClick={startCycle}
                                disabled={!cycleId || loading}
                            >
                                VAN Zyklus starten
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
                
                {/* Fehler */}
                {error && (
                    <Paper
                        sx={{
                            p: 2,
                            mb: 4,
                            bgcolor: theme.palette.error.light
                        }}
                    >
                        <Typography color="error">
                            {error}
                        </Typography>
                    </Paper>
                )}
                
                {/* Aktive Zyklen */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Typography variant="h5">
                        Aktive VAN Zyklen
                    </Typography>
                    <IconButton
                        onClick={fetchCycles}
                        disabled={loading}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
                
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 4
                    }}>
                        <CircularProgress />
                    </Box>
                ) : cycles.length > 0 ? (
                    <Grid container spacing={2}>
                        {cycles.map((cycle) => (
                            <Grid item xs={12} key={cycle.cycle_id}>
                                <Card>
                                    <CardContent>
                                        {/* Header */}
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2
                                        }}>
                                            <Typography variant="h6">
                                                Zyklus {cycle.cycle_id}
                                            </Typography>
                                            <StatusChip status={cycle.status} />
                                        </Box>
                                        
                                        {/* Fortschritt */}
                                        <Stepper
                                            activeStep={['vision', 'analysis', 'next_steps'].indexOf(cycle.stage)}
                                            sx={{ mb: 3 }}
                                        >
                                            <Step>
                                                <StepLabel>Vision</StepLabel>
                                            </Step>
                                            <Step>
                                                <StepLabel>Analyse</StepLabel>
                                            </Step>
                                            <Step>
                                                <StepLabel>Next Steps</StepLabel>
                                            </Step>
                                        </Stepper>
                                        
                                        {/* Daten */}
                                        <Grid container spacing={2}>
                                            {/* Vision Daten */}
                                            <Grid item xs={12} md={4}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{ p: 2, height: '100%' }}
                                                >
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Vision
                                                    </Typography>
                                                    <pre style={{
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {JSON.stringify(cycle.vision_data, null, 2)}
                                                    </pre>
                                                </Paper>
                                            </Grid>
                                            
                                            {/* Analyse Daten */}
                                            <Grid item xs={12} md={4}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{ p: 2, height: '100%' }}
                                                >
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Analyse
                                                    </Typography>
                                                    <pre style={{
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {JSON.stringify(cycle.analysis_data, null, 2)}
                                                    </pre>
                                                </Paper>
                                            </Grid>
                                            
                                            {/* Next Steps Daten */}
                                            <Grid item xs={12} md={4}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{ p: 2, height: '100%' }}
                                                >
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Next Steps
                                                    </Typography>
                                                    <pre style={{
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {JSON.stringify(cycle.next_steps_data, null, 2)}
                                                    </pre>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                        
                                        {/* Fehler */}
                                        {cycle.error && (
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    mt: 2,
                                                    bgcolor: theme.palette.error.light
                                                }}
                                            >
                                                <Typography color="error">
                                                    Fehler: {cycle.error}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            Keine aktiven VAN Zyklen
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default VANPhaseManager; 