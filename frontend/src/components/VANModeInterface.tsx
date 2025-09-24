import React, { useState, useEffect ,} from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Chip, Divider, Paper, Grid, IconButton, Tooltip} from '@mui/material';
import {
  PlayArrow as PlayIcon, Refresh as RefreshIcon, Save as SaveIcon, ExpandMore as ExpandMoreIcon, Assignment as AssignmentIcon, QuestionAnswer as QuestionIcon, Analytics as AnalyticsIcon} from '@mui/icons-material';;
interface VANAnalysis {
  id: string;
  requirement: string;
  analysis: string;
  clarifications: string[];
  similar_requirements: string[];
  created_at?: string;
  status?: string;
};
interface VANModeInterfaceProps {
  projectId?: string;
  onAnalysisComplete?: (analysis: VANAnalysis) => void;
};
const VANModeInterface: React.FC<VANModeInterfaceProps> = ({
  projectId = 'demo-project-van', onAnalysisComplete, }) => {;
const [requirement, setRequirement] = useState<string>('');,;
const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);,;
const [currentAnalysis, setCurrentAnalysis] = useState<VANAnalysis | null>(null);,;
const [error, setError] = useState<string | null>(null);,;
const [analysisHistory, setAnalysisHistory] = useState<VANAnalysis[]>([]);,

  // Beispiel-Anforderung laden,
  useEffect(() => {;
const loadDemoRequirement = async () => {
      try {;
const response = await fetch('/api/van/demo-requirement');,
        if (response.ok) {;
const data = await response.json();,
          setRequirement(data.requirement_text || '');,
        }
      } catch (err) {
        // Fallback zu Standard-Text,
        setRequirement('Als Disponent im VALEO NeuroERP möchte ich, dass eingehende Kundenbestellungen automatisch auf Vollständigkeit und Plausibilität geprüft werden...');,
      }
    };

    loadDemoRequirement();
  }, []);;
const handleAnalyze = async () => {
    if (!requirement.trim()) {
      setError('Bitte geben Sie eine Anforderung ein.');,
      return;,
    }

    setIsAnalyzing(true);
    setError(null);

    try {;
const response = await fetch('/api/van/analyze', {
        method: 'POST', headers: {
          'Content-Type': 'application/json', }, body: JSON.stringify({
          project_id: projectId, requirement_text: requirement.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status, }: ${response.statusText, }`);
      };
const analysis: VANAnalysis = await response.json();
      setCurrentAnalysis(analysis);
      setAnalysisHistory(prev => [analysis, ...prev]);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);,
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Analyse');
    } finally {
      setIsAnalyzing(false);,
    }
  };;
const handleSaveAnalysis = async () => {
    if (!currentAnalysis) return;,

    try {;
const response = await fetch('/api/van/save', {
        method: 'POST', headers: {
          'Content-Type': 'application/json', }, body: JSON.stringify(currentAnalysis),
      });

      if (response.ok) {
        // Erfolg anzeigen,
        console.log('Analyse gespeichert');,
      }
    } catch (err) {
      setError('Fehler beim Speichern der Analyse');,
    }
  };;
const formatAnalysisText = (text: string): string => {
    // Markdown-ähnliche Formatierung für bessere Lesbarkeit,
    return text,
      .replace(/^# (.*$)/gim, '<h1>$1</h1>'),
      .replace(/^## (.*$)/gim, '<h2>$1</h2>'),
      .replace(/^### (.*$)/gim, '<h3>$1</h3>'),
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
      .replace(/\*(.*?)\*/g, '<em>$1</em>'),
      .replace(/\n/g, '<br />');,
  };

  return (<Box className="p-6 max-w-7xl mx-auto">
      <Typography variant="h4" component="h1" gutterBottom className="text-gray-800 mb-6">
        <AssignmentIcon className="mr-3 text-blue-600" />
        VAN-Modus: Verstehen, Analysieren, Nachfragen
      </Typography>

      {/* Eingabebereich */, }
      <Card className="mb-6 shadow-lg">
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-gray-700 mb-4">
            Anforderung eingeben
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={6, };
variant="outlined"
            label="Beschreiben Sie Ihre Anforderung..."
            value={requirement, }
            onChange={(e) => setRequirement(e.target.value),}
            disabled={isAnalyzing,};
className="mb-4"
            placeholder="Beispiel: Als Benutzer möchte ich..."
          />

          <Box className="flex gap-3">
            <Button;
variant="contained"
              color="primary"
              size="large"
              onClick={handleAnalyze,}
              disabled={isAnalyzing || !requirement.trim(),}
              startIcon={isAnalyzing ? <CircularProgress size={20,} /> : <PlayIcon />}
            >
              {isAnalyzing ? 'Analysiere...' : 'VAN-Analyse starten'}
            </Button>

            <Button;
variant="outlined"
              onClick={() => setRequirement(''),}
              disabled={isAnalyzing,}
            >
              Zurücksetzen
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Fehlermeldungen */,}
      {error && (<Alert severity="error" className="mb-6">, {error, }
        </Alert>)}

      {/* Aktuelle Analyse */,}
      {currentAnalysis && (<Card className="mb-6 shadow-lg">, <CardContent>, <Box className="flex justify-between items-center mb-4">, <Typography variant="h6" className="text-gray-700">, <AnalyticsIcon className="mr-2 text-green-600" />, Analyseergebnis, </Typography>, <Box className="flex gap-2">, <Tooltip title="Analyse speichern">, <IconButton onClick={handleSaveAnalysis, } color="primary">
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                
                <Chip 
                  label={`ID: ${currentAnalysis.id}`} ;
variant="outlined" 
                  size="small" 
                />
              </Box>
            </Box>

            <Grid container spacing={3, }>
              {/* Anforderung */, }
              <Grid item xs={12, } md={6, }>
                <Paper className="p-4 bg-gray-50">
                  <Typography variant="subtitle2" className="text-gray-600 mb-2">
                    Ursprüngliche Anforderung
                  </Typography>
                  <Typography variant="body2" className="text-gray-800">
                    {currentAnalysis.requirement, }
                  </Typography>
                </Paper>
              </Grid>

              {/* Status */, }
              <Grid item xs={12, } md={6, }>
                <Paper className="p-4 bg-blue-50">
                  <Typography variant="subtitle2" className="text-blue-600 mb-2">
                    Analyse-Status
                  </Typography>
                  <Box className="flex items-center gap-2">
                    <Chip 
                      label="Abgeschlossen" 
                      color="success" 
                      size="small" 
                    />
                    <Typography variant="body2" className="text-blue-800">
                      {currentAnalysis.created_at ?, new Date(currentAnalysis.created_at).toLocaleString('de-DE') : 
                        'Gerade eben',
                      }
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Divider className="my-4" />

            {/* Detaillierte Analyse */,}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />,}>
                <Typography variant="subtitle1" className="font-semibold">
                  Detaillierte Analyse
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box ;
className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatAnalysisText(currentAnalysis.analysis) 
                  }}
                />
              </AccordionDetails>
            </Accordion>

            {/* Klärungsfragen */,}
            {currentAnalysis.clarifications.length > 0 && (<Accordion>, <AccordionSummary expandIcon={<ExpandMoreIcon />, }>
                  <Typography variant="subtitle1" className="font-semibold">
                    <QuestionIcon className="mr-2 text-orange-600" />
                    Generierte Klärungsfragen ({currentAnalysis.clarifications.length, })
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className="space-y-3">
                    {currentAnalysis.clarifications.map((question, index) => (<Paper key={index, } className="p-3 bg-orange-50 border-l-4 border-orange-400">
                        <Typography variant="body2" className="text-orange-800">
                          <strong>Frage {index + 1, }:</strong> {question, }
                        </Typography>
                      </Paper>))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Ähnliche Anforderungen */,}
            {currentAnalysis.similar_requirements.length > 0 && (<Accordion>, <AccordionSummary expandIcon={<ExpandMoreIcon />, }>
                  <Typography variant="subtitle1" className="font-semibold">
                    Ähnliche Anforderungen ({currentAnalysis.similar_requirements.length, })
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className="space-y-2">
                    {currentAnalysis.similar_requirements.map((req, index) => (<Paper key={index, } className="p-3 bg-gray-50">
                        <Typography variant="body2" className="text-gray-700">
                          {req, }
                        </Typography>
                      </Paper>))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analyse-Historie */,}
      {analysisHistory.length > 0 && (<Card className="shadow-lg">, <CardContent>, <Box className="flex justify-between items-center mb-4">, <Typography variant="h6" className="text-gray-700">, Analyse-Historie, </Typography>, <Button, variant="outlined", size="small", startIcon={<RefreshIcon />, }
                onClick={() => setAnalysisHistory([]),}
              >
                Zurücksetzen
              </Button>
            </Box>

            <Box className="space-y-3">
              {analysisHistory.slice(1).map((analysis, index) => (<Paper key={analysis.id, } className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Box className="flex justify-between items-start">
                    <Box className="flex-1">
                      <Typography variant="subtitle2" className="text-gray-800 mb-1">
                        {analysis.requirement.substring(0, 100),}...
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        ID: {analysis.id,} | 
                        {analysis.created_at ? ,
                          new Date(analysis.created_at).toLocaleString('de-DE') : 
                          'Gerade eben',
                        }
                      </Typography>
                    </Box>
                    
                    <Button
                      size="small"
                      onClick={() => setCurrentAnalysis(analysis),}
                    >
                      Anzeigen
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default VANModeInterface;
