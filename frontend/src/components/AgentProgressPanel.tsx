import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, LinearProgress, Box, List, ListItem, ListItemText } from '@mui/material';

interface ProgressItem {
  name: string;
  percent: number;
  status: string;
}

interface ProgressResponse {
  total_percent: number;
  items: ProgressItem[];
  timestamp: string;
}

const fetchProgress = async (): Promise<ProgressResponse> => {
  const viteBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  const winBase = (window as any).__VALEO_API_BASE__ as string | undefined;
  const apiBase: string = viteBase || winBase || 'http://localhost:8000/api';

  try {
    const res = await fetch(`${apiBase}/agents/progress`);
    if (res.ok) {
      const json = await res.json();
      return json as ProgressResponse;
    }
    // 404/Andere: Fallback-Mock liefern
    const now = new Date().toISOString();
    return {
      total_percent: 0,
      items: [
        { name: 'Agenten-Status', percent: 0, status: 'unbekannt' }
      ],
      timestamp: now
    };
  } catch {
    // Netzwerkfehler: ebenfalls Mock
    const now = new Date().toISOString();
    return {
      total_percent: 0,
      items: [
        { name: 'Backend nicht erreichbar', percent: 0, status: 'offline' }
      ],
      timestamp: now
    };
  }
};

export const AgentProgressPanel: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['agents-progress'],
    queryFn: fetchProgress,
    refetchInterval: 5000,
  });

  if (isLoading) return <LinearProgress />;
  if (!data) return <Typography color="error">Fortschritt konnte nicht geladen werden</Typography>;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Team‑Fortschritt
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress variant="determinate" value={data.total_percent} />
          </Box>
          <Typography variant="body2" sx={{ minWidth: 48 }}>
            {data.total_percent}%
          </Typography>
        </Box>
        <List dense>
          {data.items.map((it) => (
            <ListItem key={it.name} sx={{ py: 0.5 }}>
              <ListItemText
                primary={it.name}
                secondary={`Status: ${it.status} – ${it.percent}%`}
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Aktualisiert: {new Date(data.timestamp).toLocaleTimeString('de-DE')}
        </Typography>
      </CardContent>
    </Card>
  );
};
