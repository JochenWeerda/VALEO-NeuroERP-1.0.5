import React, { useEffect, useState } from 'react';
import { Card, Typography, Box, Chip, Alert, CircularProgress } from '../utils/muiImports';
import { usePreload } from '../services/PreloadService';
import type { BundleAnalysis as BundleAnalysisData, PerformanceMetrics } from '../services/PreloadService';

interface BundleAnalysisProps {
  showPerformance?: boolean;
  showOptimizations?: boolean;
}

export const BundleAnalysisComponent: React.FC<BundleAnalysisProps> = ({
  showPerformance = true,
  showOptimizations = true
}) => {
  const { getBundleAnalysis, getPerformanceReport, generateBundleAnalysis } = usePreload();
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysisData | null>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        
        // Bundle-Analyse laden
        const analysis = await generateBundleAnalysis();
        setBundleAnalysis(analysis);
        
        // Performance-Report laden
        if (showPerformance) {
          const report = getPerformanceReport();
          setPerformanceReport(report);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [generateBundleAnalysis, getPerformanceReport, showPerformance]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Fehler beim Laden der Bundle-Analyse: {error}
      </Alert>
    );
  }

  if (!bundleAnalysis) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Keine Bundle-Analyse verfügbar
      </Alert>
    );
  }

  const formatSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSizeColor = (size: number): string => {
    if (size < 100) return 'success';
    if (size < 500) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        📊 Bundle-Analyse
      </Typography>

      {/* Gesamtübersicht */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gesamtübersicht
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip 
            label={`Gesamtgröße: ${formatSize(bundleAnalysis.totalSize)}`}
            color={getSizeColor(bundleAnalysis.totalSize) as any}
            variant="outlined"
          />
          <Chip 
            label={`Chunks: ${bundleAnalysis.chunkCount}`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`Größter Chunk: ${bundleAnalysis.largestChunks[0]?.name || 'N/A'}`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Card>

      {/* Größte Chunks */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Größte Chunks
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          {bundleAnalysis.largestChunks.map((chunk, index) => (
            <Box key={chunk.name} display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  #{index + 1}
                </Typography>
                <Typography variant="body1">
                  {chunk.name}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Chip 
                  label={formatSize(chunk.size)}
                  color={getSizeColor(chunk.size) as any}
                  size="small"
                />
                <Chip 
                  label={`${chunk.percentage.toFixed(1)}%`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Performance-Report */}
      {showPerformance && performanceReport && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance-Metriken
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <Chip 
              label={`Durchschnittliche Ladezeit: ${performanceReport.averageLoadTime.toFixed(0)}ms`}
              color={performanceReport.averageLoadTime > 1000 ? 'error' : 'success'}
              variant="outlined"
            />
            <Chip 
              label={`Preloaded Routes: ${performanceReport.totalPreloadedRoutes}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`Cache Hit Rate: ${performanceReport.cacheHitRate.toFixed(1)}%`}
              color="secondary"
              variant="outlined"
            />
          </Box>
          
          {performanceReport.slowestRoutes.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Langsamste Routen:
              </Typography>
              {performanceReport.slowestRoutes.slice(0, 3).map((route: PerformanceMetrics, index: number) => (
                <Box key={route.route} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    {route.route}
                  </Typography>
                  <Chip 
                    label={`${route.loadTime.toFixed(0)}ms`}
                    color={route.loadTime > 1000 ? 'error' : 'warning'}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          )}
        </Card>
      )}

      {/* Optimierungsvorschläge */}
      {showOptimizations && bundleAnalysis.optimizationSuggestions.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Optimierungsvorschläge
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {bundleAnalysis.optimizationSuggestions.map((suggestion, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {suggestion}
              </Alert>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default BundleAnalysisComponent; 