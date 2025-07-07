/**
 * Optimierte Belegerfassung-Komponente
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useCache } from '../utils/cache';
import {
    TextField,
    Button,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import { debounce } from 'lodash';

interface Beleg {
    id: number;
    nummer: string;
    datum: string;
    typ: string;
    betrag: number;
    waehrung: string;
    bemerkung: string;
    // ... weitere Felder
}

interface BelegerfassungProps {
    onSave: (beleg: Beleg) => Promise<void>;
    initialData?: Partial<Beleg>;
}

export const Belegerfassung: React.FC<BelegerfassungProps> = ({
    onSave,
    initialData = {}
}) => {
    // State
    const [beleg, setBeleg] = useState<Partial<Beleg>>({
        datum: new Date().toISOString().split('T')[0],
        waehrung: 'EUR',
        ...initialData
    });
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Nächste Belegnummer aus Cache/API laden
    const { data: nextNummer, loading: loadingNummer } = useCache<string>(
        'next_beleg_nummer',
        async () => {
            const response = await fetch('/api/v1/belege/next-nummer');
            const data = await response.json();
            return data.nummer;
        },
        { ttl: 60000 } // 1 Minute
    );
    
    // Artikel-Liste aus Cache/API laden
    const { data: artikel } = useCache<any[]>(
        'artikel_list',
        async () => {
            const response = await fetch('/api/v1/artikel');
            const data = await response.json();
            return data;
        },
        { staleWhileRevalidate: true }
    );
    
    // Debounced Speichern
    const debouncedSave = useCallback(
        debounce(async (data: Partial<Beleg>) => {
            try {
                setSaving(true);
                setError(null);
                await onSave(data as Beleg);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setSaving(false);
            }
        }, 500),
        [onSave]
    );
    
    // Feldänderung
    const handleChange = (
        field: keyof Beleg,
        value: any
    ) => {
        const newBeleg = { ...beleg, [field]: value };
        setBeleg(newBeleg);
        
        // Bei bestimmten Feldern automatisch speichern
        if (['betrag', 'waehrung', 'bemerkung'].includes(field)) {
            debouncedSave(newBeleg);
        }
    };
    
    // Speichern
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await debouncedSave(beleg);
    };
    
    // Nummernfeld
    const nummerField = useMemo(() => (
        <TextField
            label="Belegnummer"
            value={beleg.nummer || nextNummer || ''}
            onChange={(e) => handleChange('nummer', e.target.value)}
            disabled={loadingNummer}
            fullWidth
            required
            margin="normal"
        />
    ), [beleg.nummer, nextNummer, loadingNummer]);
    
    // Artikel-Auswahl
    const artikelField = useMemo(() => (
        <Autocomplete
            options={artikel || []}
            getOptionLabel={(option) => option.bezeichnung}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Artikel"
                    fullWidth
                    margin="normal"
                />
            )}
            onChange={(_, value) => handleChange('artikel', value)}
            loading={!artikel}
            fullWidth
        />
    ), [artikel]);
    
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Beleg erfassen
            </Typography>
            
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        {nummerField}
                        
                        <TextField
                            label="Datum"
                            type="date"
                            value={beleg.datum}
                            onChange={(e) => handleChange('datum', e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        
                        <TextField
                            label="Typ"
                            value={beleg.typ || ''}
                            onChange={(e) => handleChange('typ', e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                            select
                        >
                            <option value="RECHNUNG">Rechnung</option>
                            <option value="GUTSCHRIFT">Gutschrift</option>
                            <option value="LIEFERSCHEIN">Lieferschein</option>
                        </TextField>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Betrag"
                            type="number"
                            value={beleg.betrag || ''}
                            onChange={(e) => handleChange('betrag', parseFloat(e.target.value))}
                            fullWidth
                            required
                            margin="normal"
                        />
                        
                        <TextField
                            label="Währung"
                            value={beleg.waehrung}
                            onChange={(e) => handleChange('waehrung', e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                            select
                        >
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                        </TextField>
                        
                        {artikelField}
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            label="Bemerkung"
                            value={beleg.bemerkung || ''}
                            onChange={(e) => handleChange('bemerkung', e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />
                    </Grid>
                </Grid>
                
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    sx={{ mt: 2 }}
                >
                    {saving ? (
                        <CircularProgress size={24} />
                    ) : (
                        'Speichern'
                    )}
                </Button>
            </form>
        </Paper>
    );
}; 