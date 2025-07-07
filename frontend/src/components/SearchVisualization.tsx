"""
VALEO-NeuroERP Search Visualization Component
"""
import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    useTheme
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
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts';

interface SearchResult {
    id: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
    score: number;
    text_score?: number;
    vector_score?: number;
    created_at: string;
    updated_at: string;
}

interface SearchVisualizationProps {
    results: SearchResult[];
}

const SearchVisualization: React.FC<SearchVisualizationProps> = ({ results }) => {
    const theme = useTheme();
    
    // Daten für Score-Verteilung
    const scoreData = results.map(result => ({
        name: result.title.substring(0, 20) + '...',
        'Gesamt Score': result.score,
        'Text Score': result.text_score || 0,
        'Vektor Score': result.vector_score || 0
    }));
    
    // Daten für Score-Korrelation
    const correlationData = results
        .filter(result => result.text_score && result.vector_score)
        .map(result => ({
            x: result.text_score,
            y: result.vector_score,
            z: result.score,
            name: result.title
        }));
    
    // Metadaten-Analyse
    const metadataTypes = new Map<string, number>();
    results.forEach(result => {
        const type = result.metadata.type;
        if (type) {
            metadataTypes.set(
                type,
                (metadataTypes.get(type) || 0) + 1
            );
        }
    });
    
    const metadataData = Array.from(metadataTypes.entries())
        .map(([type, count]) => ({
            name: type,
            count
        }));
    
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
                Suchergebnis-Analyse
            </Typography>
            
            {/* Score-Verteilung */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Score-Verteilung
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={scoreData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 60
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="Gesamt Score"
                                    fill={theme.palette.primary.main}
                                />
                                <Bar
                                    dataKey="Text Score"
                                    fill={theme.palette.secondary.main}
                                />
                                <Bar
                                    dataKey="Vektor Score"
                                    fill={theme.palette.info.main}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
            
            {/* Score-Korrelation */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Score-Korrelation
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Text Score"
                                    unit=""
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Vektor Score"
                                    unit=""
                                />
                                <ZAxis
                                    type="number"
                                    dataKey="z"
                                    name="Gesamt Score"
                                    unit=""
                                />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Legend />
                                <Scatter
                                    name="Scores"
                                    data={correlationData}
                                    fill={theme.palette.primary.main}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
            
            {/* Metadaten-Verteilung */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Dokumenttyp-Verteilung
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={metadataData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="count"
                                    name="Anzahl"
                                    fill={theme.palette.success.main}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SearchVisualization; 