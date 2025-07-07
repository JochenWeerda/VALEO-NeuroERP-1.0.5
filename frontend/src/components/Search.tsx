"""
VALEO-NeuroERP Search Component
"""
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';

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

interface SearchResponse {
    results: SearchResult[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    query_time_ms: number;
    search_type: string;
}

const SearchComponent: React.FC = () => {
    const theme = useTheme();
    
    // State
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('hybrid');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [showFilters, setShowFilters] = useState(false);
    
    // Debounced Suche
    const debouncedSearch = debounce(async (searchQuery: string) => {
        if (!searchQuery) {
            setResults([]);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/v1/search/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: searchQuery,
                    search_type: searchType,
                    page,
                    page_size: 10,
                    filters
                })
            });
            
            if (!response.ok) {
                throw new Error('Suchfehler');
            }
            
            const data: SearchResponse = await response.json();
            setResults(data.results);
            setTotalPages(data.total_pages);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, 300);
    
    // Effekt für Suchanfragen
    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query, searchType, page, filters]);
    
    // Such-Handler
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        setPage(1);
    };
    
    // Filter-Handler
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(1);
    };
    
    // Ergebnis-Rendering
    const renderResult = (result: SearchResult) => (
        <Card key={result.id} sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {result.title}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    {result.content.substring(0, 200)}...
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(result.metadata).map(([key, value]) => (
                        <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            onClick={() => handleFilterChange(`metadata.${key}`, value)}
                        />
                    ))}
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Score: {result.score.toFixed(3)}
                    </Typography>
                    {result.text_score && (
                        <Typography variant="caption" color="text.secondary">
                            Text: {result.text_score.toFixed(3)}
                        </Typography>
                    )}
                    {result.vector_score && (
                        <Typography variant="caption" color="text.secondary">
                            Vektor: {result.vector_score.toFixed(3)}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
    
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                {/* Suchleiste */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        mb: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Suchbegriff eingeben..."
                            value={query}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                                endAdornment: query && (
                                    <IconButton onClick={() => setQuery('')}>
                                        <ClearIcon />
                                    </IconButton>
                                )
                            }}
                        />
                        
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Suchmodus</InputLabel>
                            <Select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                label="Suchmodus"
                            >
                                <MenuItem value="hybrid">Hybrid</MenuItem>
                                <MenuItem value="text">Text</MenuItem>
                                <MenuItem value="vector">Vektor</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <IconButton
                            onClick={() => setShowFilters(!showFilters)}
                            color={showFilters ? 'primary' : 'default'}
                        >
                            <FilterIcon />
                        </IconButton>
                    </Box>
                    
                    {/* Filter */}
                    {showFilters && (
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                label="Dokumenttyp"
                                size="small"
                                value={filters['metadata.type'] || ''}
                                onChange={(e) => handleFilterChange('metadata.type', e.target.value)}
                            />
                            <TextField
                                label="Tag"
                                size="small"
                                value={filters['metadata.tags'] || ''}
                                onChange={(e) => handleFilterChange('metadata.tags', e.target.value)}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setFilters({});
                                    setPage(1);
                                }}
                            >
                                Filter zurücksetzen
                            </Button>
                        </Box>
                    )}
                </Paper>
                
                {/* Ergebnisse */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">
                        {error}
                    </Typography>
                ) : results.length > 0 ? (
                    <>
                        <Box sx={{ mb: 2 }}>
                            {results.map(renderResult)}
                        </Box>
                        
                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Zurück
                            </Button>
                            <Typography sx={{ alignSelf: 'center' }}>
                                Seite {page} von {totalPages}
                            </Typography>
                            <Button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Weiter
                            </Button>
                        </Box>
                    </>
                ) : query && (
                    <Typography align="center" color="text.secondary">
                        Keine Ergebnisse gefunden
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default SearchComponent; 