/**
 * VALEO-NeuroERP Workflow Manager Component
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
    Alert,
    Tooltip,
    Snackbar,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Info as InfoIcon,
    InfoOutlined,
    AutoAwesome,
    ThumbUp,
    ThumbDown,
    HelpOutline
} from '@mui/icons-material';
import { useInterval } from '../hooks/useInterval';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
} from '@mui/lab';
import Flowchart from 'react-simple-flowchart';
import ReactFlow, { Background, Controls, MiniMap, addEdge, ReactFlowProvider } from 'reactflow';
import type { FlowNode, FlowEdge, FlowConnection } from '../types/reactflow-aliases';
import 'reactflow/dist/style.css';
import { workflowTemplates } from '../templates/workflowTemplates';
import FileSaver from 'file-saver';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MuiSnackbar from '@mui/material/Snackbar';
import MuiTextField from '@mui/material/TextField';

interface WorkflowState {
    phase: string;
    mode: string;
    status: string;
    cycle_id: string;
    pipeline_id: string;
    artifacts: Record<string, any>;
    metadata: Record<string, any>;
    error?: string;
}

const helpTextDocstring = `
Eigene Workflows erstellen – So geht's:

1. Vorlage auswählen oder neuen Workflow im Editor anlegen.
2. Schritte, Typen und Abhängigkeiten nach Bedarf anpassen.
3. Mit "LangGraph ausführen" testen und visualisieren.
4. Mit "Workflow als Vorlage exportieren" als Datei speichern.
5. Eigene Vorlagen können später wieder importiert oder geteilt werden.

Tipps:
- Schritt-Typen: operation, decision, approval, inspection, noop
- Abhängigkeiten: Reihenfolge und Ablauf steuern
- JSON immer validieren (Editor zeigt Fehler an)
`;

const WorkflowManager: React.FC = () => {
    const theme = useTheme();
    
    // State
    const [pipelines, setPipelines] = useState<WorkflowState[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNewPipeline, setShowNewPipeline] = useState(false);
    const [newPipelineData, setNewPipelineData] = useState({
        cycle_id: '',
        mode: 'analysis'
    });
    const [selectedPipeline, setSelectedPipeline] = useState<WorkflowState | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [kiPrompt, setKiPrompt] = useState('');
    const [kiSuggestion, setKiSuggestion] = useState<string | null>(null);
    const [kiLoading, setKiLoading] = useState(false);
    const [kiError, setKiError] = useState<string | null>(null);
    const [kiFeedback, setKiFeedback] = useState<string | null>(null);
    const [kiFeedbackLoading, setKiFeedbackLoading] = useState(false);
    const [kiFeedbackSuccess, setKiFeedbackSuccess] = useState(false);
    const [kiFeedbackError, setKiFeedbackError] = useState<string | null>(null);
    const [automationSuggestions, setAutomationSuggestions] = useState<string[] | null>(null);
    const [automationLoading, setAutomationLoading] = useState(false);
    const [automationError, setAutomationError] = useState<string | null>(null);
    const [automationFeedback, setAutomationFeedback] = useState<string | null>(null);
    const [automationFeedbackLoading, setAutomationFeedbackLoading] = useState(false);
    const [automationFeedbackSuccess, setAutomationFeedbackSuccess] = useState(false);
    const [automationFeedbackError, setAutomationFeedbackError] = useState<string | null>(null);
    const [langGraphJson, setLangGraphJson] = useState('');
    const [langGraphInput, setLangGraphInput] = useState('');
    const [langGraphResult, setLangGraphResult] = useState<any>(null);
    const [langGraphLoading, setLangGraphLoading] = useState(false);
    const [langGraphError, setLangGraphError] = useState<string | null>(null);
    const [langGraphJsonError, setLangGraphJsonError] = useState<string | null>(null);
    const [langGraphSteps, setLangGraphSteps] = useState<any[] | null>(null);
    const [rfNodes, setRfNodes] = useState<FlowNode[]>([]);
    const [rfEdges, setRfEdges] = useState<FlowEdge[]>([]);
    const [rfInit, setRfInit] = useState(false);
    const [addNodeOpen, setAddNodeOpen] = useState(false);
    const [newNodeName, setNewNodeName] = useState('');
    const [newNodeType, setNewNodeType] = useState('operation');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [history, setHistory] = useState<{nodes: FlowNode[], edges: FlowEdge[]}[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [feedbackStats, setFeedbackStats] = useState<any>(null);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
    const [explanationOpen, setExplanationOpen] = useState(false);
    const [explanationText, setExplanationText] = useState('');
    const [showFeedbackTextFieldFor, setShowFeedbackTextFieldFor] = useState<number | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [assistantOpen, setAssistantOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant', content: string}[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantError, setAssistantError] = useState<string | null>(null);
    const [assistantJson, setAssistantJson] = useState<string | null>(null);
    const [showExecutionVisuals, setShowExecutionVisuals] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchStep, setSearchStep] = useState('');
    const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);
    const [optimizationLoading, setOptimizationLoading] = useState(false);
    const [optimizationError, setOptimizationError] = useState<string | null>(null);
    const [optimizationFeedbackSnackbar, setOptimizationFeedbackSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
    const [adoptModalOpen, setAdoptModalOpen] = useState(false);
    const [adoptSuggestion, setAdoptSuggestion] = useState<any>(null);
    const [adoptComment, setAdoptComment] = useState('');
    const [adoptSnackbar, setAdoptSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
    
    const nodeTypes = [
        'operation', 'decision', 'start', 'end', 'rag', 'llm', 'human', 'http', 'python', 'custom'
    ];
    
    // Pipelines abrufen
    const fetchPipelines = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/v1/workflow/pipelines');
            if (!response.ok) {
                throw new Error('Failed to fetch pipelines');
            }
            
            const data = await response.json();
            setPipelines(data);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };
    
    // Automatisches Aktualisieren
    useInterval(() => {
        fetchPipelines();
    }, 5000);
    
    // Initial laden
    useEffect(() => {
        fetchPipelines();
    }, []);
    
    // Pipeline starten
    const startPipeline = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/v1/workflow/pipelines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPipelineData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to start pipeline');
            }
            
            await fetchPipelines();
            setShowNewPipeline(false);
            setNewPipelineData({
                cycle_id: '',
                mode: 'analysis'
            });
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };
    
    // Phase-Farben
    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case 'VAN':
                return theme.palette.primary.main;
            case 'PLAN':
                return theme.palette.secondary.main;
            case 'CREATE':
                return theme.palette.info.main;
            case 'IMPLEMENTATION':
                return theme.palette.warning.main;
            case 'REFLECTION':
                return theme.palette.success.main;
            default:
                return theme.palette.grey[500];
        }
    };
    
    // Status-Farben
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return theme.palette.success.main;
            case 'error':
                return theme.palette.error.main;
            case 'waiting':
                return theme.palette.warning.main;
            default:
                return theme.palette.grey[500];
        }
    };
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon color="success" fontSize="small" />;
            case 'error':
                return <ErrorIcon color="error" fontSize="small" />;
            case 'started':
                return <PlayCircleIcon color="info" fontSize="small" />;
            default:
                return <AccessTimeIcon color="disabled" fontSize="small" />;
        }
    };
    
    const fetchKISuggestion = async () => {
        if (!kiPrompt.trim()) return;
        setKiLoading(true);
        setKiError(null);
        setKiSuggestion(null);
        try {
            const response = await fetch('/api/v1/workflow/ki-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: kiPrompt,
                    system_prompt: selectedPipeline ? `Kontext: Phase ${selectedPipeline.phase}, Modus ${selectedPipeline.mode}` : '',
                    llm_config: {},
                    dependencies: selectedPipeline ? { pipeline_id: selectedPipeline.pipeline_id, phase: selectedPipeline.phase } : {}
                })
            });
            if (!response.ok) throw new Error('Fehler beim Abrufen des KI-Vorschlags');
            const data = await response.json();
            setKiSuggestion(data.result?.choices?.[0]?.message?.content || JSON.stringify(data.result));
        } catch (err: any) {
            setKiError(err.message || 'Unbekannter Fehler');
        } finally {
            setKiLoading(false);
        }
    };
    
    const sendKIFeedback = async (feedback: 'helpful' | 'not_helpful') => {
        setKiFeedbackLoading(true);
        setKiFeedbackError(null);
        setKiFeedbackSuccess(false);
        try {
            await fetch('/api/v1/workflow/ki-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pipeline_id: selectedPipeline?.pipeline_id,
                    phase: selectedPipeline?.phase,
                    prompt: kiPrompt,
                    suggestion: kiSuggestion,
                    feedback
                })
            });
            setKiFeedback(feedback);
            setKiFeedbackSuccess(true);
        } catch (err: any) {
            setKiFeedbackError('Fehler beim Senden des Feedbacks');
        } finally {
            setKiFeedbackLoading(false);
        }
    };
    
    const fetchAutomationSuggestions = async () => {
        if (!selectedPipeline) return;
        setAutomationLoading(true);
        setAutomationError(null);
        setAutomationSuggestions(null);
        try {
            // Feedback-Statistiken für die Pipeline laden
            let feedbackStatsLocal = null;
            try {
                const statsRes = await fetch(`/api/v1/workflow/ki-feedback-stats?pipeline_id=${selectedPipeline.pipeline_id}`);
                if (statsRes.ok) {
                    feedbackStatsLocal = await statsRes.json();
                    setFeedbackStats(feedbackStatsLocal);
                } else {
                    setFeedbackStats(null);
                }
            } catch (e) {
                setFeedbackStats(null);
            }
            const response = await fetch('/api/v1/workflow/automation-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow_context: selectedPipeline,
                    feedback_stats: feedbackStatsLocal
                })
            });
            if (!response.ok) throw new Error('Fehler beim Abrufen der Automatisierungsvorschläge');
            const data = await response.json();
            let suggestions: string[] = [];
            if (Array.isArray(data.suggestions?.choices)) {
                const content = data.suggestions.choices[0]?.message?.content || '';
                suggestions = content.split(/\n|\r/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            } else if (typeof data.suggestions === 'string') {
                suggestions = data.suggestions.split(/\n|\r/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            }
            setAutomationSuggestions(suggestions);
        } catch (err: any) {
            setAutomationError(err.message || 'Unbekannter Fehler');
        } finally {
            setAutomationLoading(false);
        }
    };
    
    const executeLangGraph = async () => {
        setLangGraphLoading(true);
        setLangGraphError(null);
        setLangGraphResult(null);
        try {
            const graph = JSON.parse(langGraphJson);
            const input_data = langGraphInput ? JSON.parse(langGraphInput) : {};
            const response = await fetch('/api/v1/workflow/langgraph-execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    graph_id: graph.name || 'custom_graph',
                    steps: graph.steps,
                    config: graph.config || {},
                    name: graph.name || '',
                    description: graph.description || '',
                    input_data
                })
            });
            if (!response.ok) throw new Error('Fehler bei der Ausführung des LangGraph-Workflows');
            const data = await response.json();
            setLangGraphResult(data.result);
        } catch (err: any) {
            setLangGraphError(err.message || 'Unbekannter Fehler');
        } finally {
            setLangGraphLoading(false);
        }
    };
    
    // Validierung und Visualisierung der Graph-Definition
    useEffect(() => {
        if (!langGraphJson.trim()) {
            setLangGraphJsonError(null);
            setLangGraphSteps(null);
            return;
        }
        try {
            const graph = JSON.parse(langGraphJson);
            if (!graph.name || !Array.isArray(graph.steps)) {
                setLangGraphJsonError('Graph-Definition muss mindestens "name" und "steps" (als Array) enthalten.');
                setLangGraphSteps(null);
                return;
            }
            setLangGraphJsonError(null);
            setLangGraphSteps(graph.steps);
        } catch (e: any) {
            setLangGraphJsonError('Ungültiges JSON: ' + e.message);
            setLangGraphSteps(null);
        }
    }, [langGraphJson]);
    
    // Mapping: JSON -> ReactFlow
    useEffect(() => {
        if (!langGraphSteps) return;
        const nodes: FlowNode[] = langGraphSteps.map((step, idx) => ({
            id: step.name,
            data: { label: `${step.name} (${step.type})` },
            position: { x: 100 + idx * 150, y: 100 },
            type: undefined,
        }));
        const edges: FlowEdge[] = [];
        langGraphSteps.forEach((step) => {
            if (step.dependencies && step.dependencies.length > 0) {
                step.dependencies.forEach((dep: string) => {
                    edges.push({ id: `${dep}->${step.name}`, source: dep, target: step.name, type: undefined });
                });
            }
        });
        setRfNodes(nodes);
        setRfEdges(edges);
        setRfInit(true);
    }, [langGraphSteps]);

    // Mapping: ReactFlow -> JSON (bei Änderung)
    const onNodesChange = (changes: any) => {
        setRfNodes((nds) => nds.map((node) => {
            const change = changes.find((c: any) => c.id === node.id);
            return change ? { ...node, ...change } : node;
        }));
    };
    const onEdgesChange = (changes: any) => {
        setRfEdges((eds) => eds.map((edge) => {
            const change = changes.find((c: any) => c.id === edge.id);
            return change ? { ...edge, ...change } : edge;
        }));
    };
    const onConnect = (connection: FlowConnection) => {
        setRfEdges((eds) => addEdge(connection, eds));
    };
    // Editor -> JSON-Definition (optional: Button zum Übernehmen)
    const rfToJson = () => {
        // Erzeuge steps aus rfNodes/rfEdges
        const steps = rfNodes.map((node) => ({
            name: node.id,
            type: (node.data && node.data.label && node.data.label.split('(')[1]) ? node.data.label.split('(')[1].replace(')', '').trim() : 'operation',
            config: {},
            dependencies: rfEdges.filter(e => e.target === node.id).map(e => e.source)
        }));
        setLangGraphJson(JSON.stringify({ name: 'Flow-Editor', steps }, null, 2));
    };
    
    // Hilfsfunktion: Generiere Flowchart-Code aus LangGraph-Schritten
    function generateFlowchartCode(steps: any[]): string {
        if (!steps || steps.length === 0) return '';
        // Knoten definieren
        let code = '';
        const nodeMap: Record<string, string> = {};
        steps.forEach((step, idx) => {
            const id = step.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `step${idx}`;
            nodeMap[step.name] = id;
            code += `${id}=>operation: ${step.name} (${step.type})\n`;
        });
        // Verbindungen
        steps.forEach((step, idx) => {
            const from = nodeMap[step.name];
            if (step.dependencies && step.dependencies.length > 0) {
                step.dependencies.forEach((dep: string) => {
                    const to = from;
                    const fromDep = nodeMap[dep];
                    code += `${fromDep}->${to}\n`;
                });
            } else if (idx > 0) {
                // Fallback: lineare Verbindung
                const prev = nodeMap[steps[idx - 1].name];
                code += `${prev}->${from}\n`;
            }
        });
        return code;
    }
    
    // Node-Selection-Handler für Löschfunktion
    const onNodeClick = (_: any, node: FlowNode) => {
        setSelectedNodeId(node.id);
    };
    // Knoten hinzufügen
    const handleAddNode = () => {
        setRfNodes(nodes => ([
            ...nodes,
            {
                id: newNodeName,
                data: { label: `${newNodeName} (${newNodeType})` },
                position: { x: 100 + nodes.length * 150, y: 200 },
                type: undefined,
            } as FlowNode
        ]));
        setAddNodeOpen(false);
        setNewNodeName('');
        setNewNodeType('operation');
    };
    // Knoten löschen
    const handleDeleteNode = () => {
        if (!selectedNodeId) return;
        setRfNodes(nodes => nodes.filter(n => n.id !== selectedNodeId));
        setRfEdges(edges => edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
        setSelectedNodeId(null);
    };
    
    // History-Update bei Änderungen
    useEffect(() => {
        if (!rfInit) return;
        // Nur speichern, wenn sich etwas geändert hat
        if (historyIndex === -1 ||
            JSON.stringify(history[historyIndex]?.nodes) !== JSON.stringify(rfNodes) ||
            JSON.stringify(history[historyIndex]?.edges) !== JSON.stringify(rfEdges)) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push({ nodes: rfNodes, edges: rfEdges });
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rfNodes, rfEdges]);

    // Undo/Redo-Handler
    const handleUndo = () => {
        if (historyIndex > 0) {
            setRfNodes(history[historyIndex - 1].nodes);
            setRfEdges(history[historyIndex - 1].edges);
            setHistoryIndex(historyIndex - 1);
        }
    };
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setRfNodes(history[historyIndex + 1].nodes);
            setRfEdges(history[historyIndex + 1].edges);
            setHistoryIndex(historyIndex + 1);
        }
    };
    
    // Vorlage übernehmen
    const handleTemplateSelect = (label: string) => {
        const template = workflowTemplates.find(t => t.label === label);
        if (template) {
            setLangGraphJson(JSON.stringify(template.json, null, 2));
            setTemplateDialogOpen(false);
            setSelectedTemplate(label);
        }
    };
    
    // Hilfsfunktion: Schrittname aus Vorschlag extrahieren
    const extractStepName = (suggestion: string) => {
        const match = suggestion.match(/Schritt ['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    };

    // Hilfsfunktion: Prüft, ob Vorschlag eine Automatisierung empfiehlt
    const extractAutomationTarget = (suggestion: string) => {
        const match = suggestion.match(/Schritt ['"]([^'"]+)['"].*automatisieren/i);
        return match ? match[1] : null;
    };

    // Übernahme-Handler
    const handleAdoptSuggestion = (s: any) => {
        setAdoptSuggestion(s);
        setAdoptComment('');
        setAdoptModalOpen(true);
    };
    const handleConfirmAdopt = () => {
        try {
            const json = JSON.parse(langGraphJson);
            if (!json.comments) json.comments = [];
            json.comments.push({ text: adoptSuggestion.suggestion, reason: adoptSuggestion.reason, userComment: adoptComment, timestamp: new Date().toISOString() });
            // Schritt markieren, falls erkannt
            const stepName = extractStepName(adoptSuggestion.suggestion);
            if (stepName && Array.isArray(json.steps)) {
                json.steps = json.steps.map((step: any) => step.name === stepName ? { ...step, highlighted: true } : step);
            }
            // Automatisierung: Typ-Wechsel von 'human' auf 'operation'
            const autoStep = extractAutomationTarget(adoptSuggestion.suggestion);
            if (autoStep && Array.isArray(json.steps)) {
                json.steps = json.steps.map((step: any) => (step.name === autoStep && step.type === 'human') ? { ...step, type: 'operation' } : step);
            }
            setLangGraphJson(JSON.stringify(json, null, 2));
            setAdoptSnackbar({open: true, message: 'Vorschlag übernommen!'});
        } catch {
            setAdoptSnackbar({open: true, message: 'Fehler beim Übernehmen des Vorschlags.'});
        }
        setAdoptModalOpen(false);
        setAdoptSuggestion(null);
    };

    // Handler für Erklärung
    const handleShowExplanation = (suggestion: any) => {
        setExplanationText(suggestion.explanation || 'Dieser Vorschlag wurde KI-basiert aus Workflow-Kontext und Nutzerfeedback generiert.');
        setExplanationOpen(true);
    };
    const handleCloseExplanation = () => setExplanationOpen(false);

    // Handler für Feedback
    const handleSendFeedbackText = (idx: number) => {
        setSnackbar({open: true, message: 'Feedback gesendet.'});
        setShowFeedbackTextFieldFor(null);
        setFeedbackText('');
        // TODO: Feedback-API-Call mit Text
    };

    // Dummy-Mapping für Badges/Zähler (später aus Backend)
    const mapSuggestions = (suggestions: string[]) => suggestions.map((s, i) => ({
        text: s,
        isTop: i === 0, // Erster Vorschlag als Top markieren
        isImprovement: s.toLowerCase().includes('verbesserung'),
        helpfulCount: Math.floor(Math.random()*10),
        notHelpfulCount: Math.floor(Math.random()*5),
        explanation: i === 0 ? 'Dieser Vorschlag wurde besonders häufig als hilfreich bewertet.' : undefined
    }));

    // Handler für Export
    const handleExportWorkflow = () => {
        const blob = new Blob([langGraphJson], { type: 'application/json;charset=utf-8' });
        FileSaver.saveAs(blob, 'workflow.json');
    };

    // Handler für Import
    const handleImportWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                setLangGraphJson(JSON.stringify(json, null, 2));
                setImportError(null);
            } catch (err: any) {
                setImportError('Ungültige JSON-Datei: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    // Handler für Chat senden
    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        setChatHistory(h => [...h, { role: 'user', content: chatInput }]);
        setAssistantLoading(true);
        setAssistantError(null);
        try {
            // API-Call an LLMService (Platzhalter-Endpoint)
            const response = await fetch('/api/v1/llm/workflow-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...chatHistory, { role: 'user', content: chatInput }] })
            });
            if (!response.ok) throw new Error('Fehler bei der Kommunikation mit der KI');
            const data = await response.json();
            setChatHistory(h => [...h, { role: 'assistant', content: data.reply }]);
            // Versuche, JSON aus der Antwort zu extrahieren
            try {
                const jsonStart = data.reply.indexOf('{');
                const json = data.reply.slice(jsonStart);
                JSON.parse(json); // Test ob gültig
                setAssistantJson(json);
            } catch {
                setAssistantJson(null);
            }
        } catch (err: any) {
            setAssistantError(err.message || 'Unbekannter Fehler');
        } finally {
            setAssistantLoading(false);
            setChatInput('');
        }
    };

    // Handler für Übernahme
    const handleAdoptAssistantJson = () => {
        if (assistantJson) setLangGraphJson(JSON.stringify(JSON.parse(assistantJson), null, 2));
        setAssistantOpen(false);
        setAssistantJson(null);
        setChatHistory([]);
    };

    // Hilfsfunktion: Kommentare aus Workflow-JSON extrahieren
    const getWorkflowComments = () => {
        try {
            const json = JSON.parse(langGraphJson);
            return Array.isArray(json.comments) ? json.comments : [];
        } catch {
            return [];
        }
    };

    // Hilfsfunktion: Highlight-Status für Schritt
    const isStepHighlighted = (step: any) => step.highlighted === true;

    const handleSuggestionFeedback = async (suggestion: any, feedback: 'helpful' | 'not_helpful', idx: number) => {
        try {
            await fetch('/api/v1/workflow/automation-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suggestion: suggestion.text,
                    feedback,
                    comment: feedback === 'not_helpful' ? feedbackText : undefined
                })
            });
            if (feedback === 'not_helpful') {
                setShowFeedbackTextFieldFor(idx);
            } else {
                setShowFeedbackTextFieldFor(null);
                setFeedbackText('');
            }
            setSnackbar({open: true, message: 'Feedback gespeichert!'});
        } catch {
            setSnackbar({open: true, message: 'Fehler beim Senden des Feedbacks.'});
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4
                }}>
                    <Typography variant="h4">
                        Workflow Manager
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => fetchPipelines()}
                            startIcon={<RefreshIcon />}
                        >
                            Aktualisieren
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={() => setShowNewPipeline(true)}
                            startIcon={<AddIcon />}
                        >
                            Neue Pipeline
                        </Button>
                    </Box>
                </Box>
                
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
                
                {/* Pipeline-Liste */}
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 4
                    }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Pipeline ID</TableCell>
                                    <TableCell>Zyklus ID</TableCell>
                                    <TableCell>Phase</TableCell>
                                    <TableCell>Modus</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Aktionen</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pipelines.map((pipeline) => (
                                    <TableRow key={pipeline.pipeline_id}>
                                        <TableCell>{pipeline.pipeline_id}</TableCell>
                                        <TableCell>{pipeline.cycle_id}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={pipeline.phase}
                                                sx={{
                                                    bgcolor: getPhaseColor(pipeline.phase),
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{pipeline.mode}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={pipeline.status}
                                                sx={{
                                                    bgcolor: getStatusColor(pipeline.status),
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedPipeline(pipeline);
                                                    setShowDetails(true);
                                                }}
                                            >
                                                <InfoIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                
                {/* Neue Pipeline Dialog */}
                <Dialog
                    open={showNewPipeline}
                    onClose={() => setShowNewPipeline(false)}
                >
                    <DialogTitle>
                        Neue Pipeline starten
                    </DialogTitle>
                    
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Zyklus ID"
                                value={newPipelineData.cycle_id}
                                onChange={(e) => setNewPipelineData(prev => ({
                                    ...prev,
                                    cycle_id: e.target.value
                                }))}
                            />
                            
                            <FormControl fullWidth>
                                <InputLabel>Modus</InputLabel>
                                <Select
                                    value={newPipelineData.mode}
                                    onChange={(e) => setNewPipelineData(prev => ({
                                        ...prev,
                                        mode: e.target.value
                                    }))}
                                    label="Modus"
                                >
                                    <MenuItem value="analysis">Analyse</MenuItem>
                                    <MenuItem value="design">Design</MenuItem>
                                    <MenuItem value="development">Entwicklung</MenuItem>
                                    <MenuItem value="testing">Testing</MenuItem>
                                    <MenuItem value="deployment">Deployment</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    
                    <DialogActions>
                        <Button
                            onClick={() => setShowNewPipeline(false)}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            variant="contained"
                            onClick={startPipeline}
                            disabled={!newPipelineData.cycle_id}
                        >
                            Starten
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Details Dialog */}
                <Dialog
                    open={showDetails}
                    onClose={() => setShowDetails(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Pipeline Details
                    </DialogTitle>
                    
                    <DialogContent>
                        {selectedPipeline && (
                            <Box sx={{ pt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2">
                                            Pipeline ID
                                        </Typography>
                                        <Typography>
                                            {selectedPipeline.pipeline_id}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2">
                                            Zyklus ID
                                        </Typography>
                                        <Typography>
                                            {selectedPipeline.cycle_id}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2">
                                            Phase
                                        </Typography>
                                        <Chip
                                            label={selectedPipeline.phase}
                                            sx={{
                                                bgcolor: getPhaseColor(selectedPipeline.phase),
                                                color: 'white'
                                            }}
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={selectedPipeline.status}
                                            sx={{
                                                bgcolor: getStatusColor(selectedPipeline.status),
                                                color: 'white'
                                            }}
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2">
                                            Artefakte
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
                                            <pre>
                                                {JSON.stringify(selectedPipeline.artifacts, null, 2)}
                                            </pre>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2">
                                            Metadaten
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
                                            <pre>
                                                {JSON.stringify(selectedPipeline.metadata, null, 2)}
                                            </pre>
                                        </Paper>
                                    </Grid>
                                    
                                    {selectedPipeline.error && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="error">
                                                Fehler
                                            </Typography>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    bgcolor: theme.palette.error.light
                                                }}
                                            >
                                                <Typography color="error">
                                                    {selectedPipeline.error}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                    
                                    <Grid item xs={12}>
                                        <Box mt={4} p={2} bgcolor={theme.palette.grey[100]} borderRadius={2}>
                                            <Typography variant="h6" gutterBottom>KI-Vorschlag</Typography>
                                            <TextField
                                                label="Prompt an die KI"
                                                value={kiPrompt}
                                                onChange={e => setKiPrompt(e.target.value)}
                                                fullWidth
                                                multiline
                                                minRows={2}
                                                sx={{ mb: 2 }}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={fetchKISuggestion}
                                                disabled={kiLoading || !kiPrompt.trim()}
                                            >
                                                {kiLoading ? 'Lade...' : 'KI-Vorschlag abrufen'}
                                            </Button>
                                            {kiError && <Typography color="error" sx={{ mt: 2 }}>{kiError}</Typography>}
                                            {kiSuggestion && (
                                                <Paper sx={{ mt: 2, p: 2, bgcolor: theme.palette.background.default }}>
                                                    <Typography variant="body1">{kiSuggestion}</Typography>
                                                </Paper>
                                            )}
                                            {kiSuggestion && (
                                                <Box mt={2}>
                                                    <Typography variant="subtitle2" gutterBottom>War der Vorschlag hilfreich?</Typography>
                                                    <Button
                                                        variant={kiFeedback === 'helpful' ? 'contained' : 'outlined'}
                                                        color="success"
                                                        onClick={() => sendKIFeedback('helpful')}
                                                        disabled={kiFeedbackLoading || kiFeedbackSuccess}
                                                        sx={{ mr: 2 }}
                                                    >
                                                        Hilfreich
                                                    </Button>
                                                    <Button
                                                        variant={kiFeedback === 'not_helpful' ? 'contained' : 'outlined'}
                                                        color="error"
                                                        onClick={() => sendKIFeedback('not_helpful')}
                                                        disabled={kiFeedbackLoading || kiFeedbackSuccess}
                                                    >
                                                        Nicht hilfreich
                                                    </Button>
                                                    {kiFeedbackSuccess && (
                                                        <Typography color="success.main" sx={{ mt: 1 }}>Danke für Ihr Feedback!</Typography>
                                                    )}
                                                    {kiFeedbackError && (
                                                        <Typography color="error" sx={{ mt: 1 }}>{kiFeedbackError}</Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Box mt={4} p={2} bgcolor={theme.palette.grey[100]} borderRadius={2}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <Typography variant="h6" gutterBottom flexGrow={1}>
                                                    Automatisierungsvorschläge
                                                </Typography>
                                                <Tooltip title="Die Vorschläge werden KI-basiert aus Workflow-Kontext und Nutzerfeedback generiert.">
                                                    <InfoOutlined fontSize="small" color="action" />
                                                </Tooltip>
                                            </Box>
                                            {feedbackStats && (
                                                <Alert severity="info" sx={{ mb: 2 }}>
                                                    Trefferquote: {feedbackStats.helpful_ratio !== null ? (feedbackStats.helpful_ratio * 100).toFixed(1) : '–'}% | Feedbacks: {feedbackStats.total}
                                                    {feedbackStats.improvement_examples?.length > 0 && (
                                                        <> | Verbesserungspotenzial: {feedbackStats.improvement_examples[0].prompt}</>
                                                    )}
                                                </Alert>
                                            )}
                                            <Button
                                                variant="contained"
                                                onClick={fetchAutomationSuggestions}
                                                disabled={automationLoading}
                                                sx={{ mb: 2 }}
                                                startIcon={automationLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
                                            >
                                                {automationLoading ? 'Lade...' : 'Automatisierungsvorschläge abrufen'}
                                            </Button>
                                            {automationError && (
                                                <Alert severity="error" sx={{ mt: 2 }}>
                                                    {automationError}
                                                    <Button size="small" onClick={fetchAutomationSuggestions}>Erneut versuchen</Button>
                                                </Alert>
                                            )}
                                            {automationSuggestions && (
                                                <Box>
                                                    {mapSuggestions(automationSuggestions).map((s, i) => (
                                                        <Card key={i} sx={{ mb: 2, borderLeft: s.isImprovement ? '4px solid orange' : undefined }}>
                                                            <CardContent>
                                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                    <Typography variant="body1">{s.text}</Typography>
                                                                    <Tooltip title="Warum dieser Vorschlag?">
                                                                        <IconButton size="small" onClick={() => handleShowExplanation(s)}>
                                                                            <InfoOutlined fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                                <Box mt={1} display="flex" gap={1} alignItems="center">
                                                                    {s.isTop && <Chip label="Top-Vorschlag" color="success" size="small" />}
                                                                    {s.isImprovement && <Chip label="Verbesserungspotenzial" color="warning" size="small" />}
                                                                </Box>
                                                                <Box mt={1} display="flex" gap={1} alignItems="center">
                                                                    <Button size="small" variant="outlined" color="primary" onClick={() => handleAdoptSuggestion(s)}>Übernehmen</Button>
                                                                    <Button size="small" variant="outlined" color="success" startIcon={<ThumbUp />} onClick={() => handleSuggestionFeedback(s, 'helpful', i)}>
                                                                        Hilfreich
                                                                    </Button>
                                                                    <Button size="small" variant="outlined" color="error" startIcon={<ThumbDown />} onClick={() => handleSuggestionFeedback(s, 'not_helpful', i)}>
                                                                        Nicht hilfreich
                                                                    </Button>
                                                                </Box>
                                                                {showFeedbackTextFieldFor === i && (
                                                                    <Box mt={1}>
                                                                        <TextField
                                                                            label="Was war unpassend?"
                                                                            value={feedbackText}
                                                                            onChange={e => setFeedbackText(e.target.value)}
                                                                            size="small"
                                                                            fullWidth
                                                                            sx={{ mb: 1 }}
                                                                        />
                                                                        <Button size="small" variant="contained" onClick={() => handleSendFeedbackText(i)} disabled={!feedbackText.trim()}>
                                                                            Feedback senden
                                                                        </Button>
                                                                    </Box>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                    <Dialog open={explanationOpen} onClose={handleCloseExplanation}>
                                                        <DialogTitle>Erklärung zum Vorschlag</DialogTitle>
                                                        <DialogContent>
                                                            <Typography>{explanationText}</Typography>
                                                        </DialogContent>
                                                    </Dialog>
                                                </Box>
                                            )}
                                            <Snackbar
                                                open={snackbar.open}
                                                autoHideDuration={2500}
                                                onClose={() => setSnackbar({open: false, message: ''})}
                                                message={snackbar.message}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                                action={
                                                    <IconButton size="small" color="inherit" onClick={() => setSnackbar({open: false, message: ''})}>
                                                        ×
                                                    </IconButton>
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Box mt={4} p={2} bgcolor={theme.palette.grey[100]} borderRadius={2}>
                                            <Typography variant="h6" gutterBottom>LangGraph-Workflow testen</Typography>
                                            <TextField
                                                label="Graph-Definition (JSON)"
                                                value={langGraphJson}
                                                onChange={e => setLangGraphJson(e.target.value)}
                                                fullWidth
                                                multiline
                                                minRows={4}
                                                sx={{ mb: 2 }}
                                                placeholder={`{\n  \"name\": \"Testgraph\",\n  \"steps\": [\n    {\"name\": \"start\", \"type\": \"noop\", \"config\": {}, \"dependencies\": []},\n    {\"name\": \"step1\", \"type\": \"noop\", \"config\": {}, \"dependencies\": [\"start\"]}\n  ]\n}`}
                                                error={!!langGraphJsonError}
                                                helperText={langGraphJsonError}
                                            />
                                            {langGraphSteps && (
                                                <Paper sx={{ mb: 2, p: 2, bgcolor: theme.palette.background.default }}>
                                                    <Typography variant="subtitle2">Workflow-Schritte (Abfolge)</Typography>
                                                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                                                        {langGraphSteps.map((step, i) => (
                                                            <li key={i}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Typography variant="body2" sx={{ fontWeight: isStepHighlighted(step) ? 'bold' : 'normal', color: isStepHighlighted(step) ? 'orange' : 'inherit' }}>
                                                                        <b>{step.name}</b> ({step.type})
                                                                        {step.dependencies && step.dependencies.length > 0 && (
                                                                            <span> &rarr; nach: {step.dependencies.join(', ')}</span>
                                                                        )}
                                                                    </Typography>
                                                                    {isStepHighlighted(step) && <Chip label="Optimierung" color="warning" size="small" />}
                                                                </Box>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </Paper>
                                            )}
                                            {langGraphSteps && langGraphSteps.length > 1 && (
                                                <Paper sx={{ mb: 2, p: 2, bgcolor: theme.palette.background.default }}>
                                                    <Typography variant="subtitle2">Flowchart-Visualisierung</Typography>
                                                    <Flowchart
                                                        chartCode={generateFlowchartCode(langGraphSteps)}
                                                        options={{
                                                            x: 0,
                                                            y: 0,
                                                            'line-width': 2,
                                                            'line-length': 40,
                                                            'text-margin': 10,
                                                            'font-size': 14,
                                                            'font-color': 'black',
                                                            'line-color': 'black',
                                                            'element-color': 'black',
                                                            fill: 'white',
                                                            scale: 1,
                                                        }}
                                                    />
                                                </Paper>
                                            )}
                                            <TextField
                                                label="Input-Daten (JSON)"
                                                value={langGraphInput}
                                                onChange={e => setLangGraphInput(e.target.value)}
                                                fullWidth
                                                multiline
                                                minRows={2}
                                                sx={{ mb: 2 }}
                                                placeholder={`{"workflow_id": "testgraph", "user_id": "testuser"}`}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={executeLangGraph}
                                                disabled={langGraphLoading || !langGraphJson.trim()}
                                            >
                                                {langGraphLoading ? 'Lade...' : 'LangGraph ausführen'}
                                            </Button>
                                            {langGraphError && <Typography color="error" sx={{ mt: 2 }}>{langGraphError}</Typography>}
                                            {langGraphResult && (
                                                <Paper sx={{ mt: 2, p: 2, bgcolor: theme.palette.background.default }}>
                                                    <Typography variant="subtitle2">Ergebnis</Typography>
                                                    <pre style={{ margin: 0 }}>{JSON.stringify(langGraphResult, null, 2)}</pre>
                                                    <FormControlLabel
                                                        control={<Switch checked={showExecutionVisuals} onChange={e => setShowExecutionVisuals(e.target.checked)} />}
                                                        label="Ausführungspfad-Visualisierungen anzeigen"
                                                        sx={{ mt: 2 }}
                                                    />
                                                    {showExecutionVisuals && Array.isArray(langGraphResult.execution_path) && langGraphResult.execution_path.length > 0 && (
                                                        <Box mt={2}>
                                                            <Typography variant="subtitle2">Ausführungspfad (Timeline)</Typography>
                                                            <Timeline position="alternate">
                                                                {langGraphResult.execution_path.map((step: any, idx: number) => (
                                                                    <TimelineItem key={idx}>
                                                                        <TimelineOppositeContent sx={{ flex: 0.2, fontSize: 12 }} color="text.secondary">
                                                                            {step.timestamp ? new Date(step.timestamp * 1000).toLocaleTimeString() : ''}
                                                                        </TimelineOppositeContent>
                                                                        <TimelineSeparator>
                                                                            <TimelineDot color={step.status === 'completed' ? 'success' : step.status === 'error' ? 'error' : 'info'}>
                                                                                {getStatusIcon(step.status)}
                                                                            </TimelineDot>
                                                                            {idx < langGraphResult.execution_path.length - 1 && <TimelineConnector />}
                                                                        </TimelineSeparator>
                                                                        <TimelineContent>
                                                                            <Tooltip title={`Typ: ${step.type}\nStatus: ${step.status}${step.error ? '\nFehler: ' + step.error : ''}`.replace(/\\n/g, '\n')} placement="right">
                                                                                <span>{step.step}</span>
                                                                            </Tooltip>
                                                                        </TimelineContent>
                                                                    </TimelineItem>
                                                                ))}
                                                            </Timeline>
                                                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Ausführungspfad (Stepper)</Typography>
                                                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                                                {langGraphResult.execution_path.map((step: any, idx: number) => (
                                                                    <Tooltip key={idx} title={`Typ: ${step.type}\nStatus: ${step.status}${step.error ? '\nFehler: ' + step.error : ''}`.replace(/\\n/g, '\n')} placement="top">
                                                                        <Box display="flex" flexDirection="column" alignItems="center">
                                                                            {getStatusIcon(step.status)}
                                                                            <Typography variant="caption">{step.step}</Typography>
                                                                        </Box>
                                                                    </Tooltip>
                                                                ))}
                                                            </Box>
                                                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Heatmap (Dauer pro Schritt)</Typography>
                                                            <Box display="flex" gap={1} alignItems="flex-end" mt={1}>
                                                                {(() => {
                                                                    // Dauer pro Schritt berechnen (completed - started)
                                                                    const durations: number[] = [];
                                                                    const byStep: Record<string, { started?: number, completed?: number }> = {};
                                                                    langGraphResult.execution_path.forEach((s: any) => {
                                                                        if (!byStep[s.step]) byStep[s.step] = {};
                                                                        if (s.status === 'started') byStep[s.step].started = s.timestamp;
                                                                        if (s.status === 'completed') byStep[s.step].completed = s.timestamp;
                                                                    });
                                                                    Object.values(byStep).forEach(({ started, completed }) => {
                                                                        if (started && completed) durations.push(completed - started);
                                                                    });
                                                                    const max = Math.max(...durations, 0);
                                                                    return Object.entries(byStep).map(([step, { started, completed }], idx) => {
                                                                        const duration = started && completed ? completed - started : 0;
                                                                        return (
                                                                            <Box key={step} sx={{ width: 40, height: 20 + (duration && max ? (duration / max) * 60 : 0), bgcolor: duration ? 'primary.main' : 'grey.300', borderRadius: 1, textAlign: 'center' }}>
                                                                                <Tooltip title={`Schritt: ${step}\nDauer: ${duration.toFixed(3)}s`} placement="top">
                                                                                    <Typography variant="caption" color="#fff">{duration ? duration.toFixed(2) : ''}</Typography>
                                                                                </Tooltip>
                                                                            </Box>
                                                                        );
                                                                    });
                                                                })()}
                                                            </Box>
                                                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Tabelle (mit Filter/Suche)</Typography>
                                                            <Box display="flex" gap={2} mb={1}>
                                                                <TextField size="small" label="Status-Filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ width: 150 }} />
                                                                <TextField size="small" label="Schritt-Suche" value={searchStep} onChange={e => setSearchStep(e.target.value)} sx={{ width: 200 }} />
                                                            </Box>
                                                            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                                                <Table size="small" stickyHeader>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Schritt</TableCell>
                                                                            <TableCell>Typ</TableCell>
                                                                            <TableCell>Status</TableCell>
                                                                            <TableCell>Zeitstempel</TableCell>
                                                                            <TableCell>Fehler</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {langGraphResult.execution_path
                                                                            .filter((step: any) => (!filterStatus || step.status === filterStatus) && (!searchStep || step.step.toLowerCase().includes(searchStep.toLowerCase())))
                                                                            .map((step: any, idx: number) => (
                                                                                <TableRow key={idx}>
                                                                                    <TableCell>{step.step}</TableCell>
                                                                                    <TableCell>{step.type}</TableCell>
                                                                                    <TableCell>{step.status}</TableCell>
                                                                                    <TableCell>{step.timestamp ? new Date(step.timestamp * 1000).toLocaleString() : ''}</TableCell>
                                                                                    <TableCell>{step.error || ''}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            )}
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Box mt={4} p={2} bgcolor={theme.palette.grey[100]} borderRadius={2}>
                                            <Typography variant="h6" gutterBottom>Interaktiver Workflow-Editor (Drag & Drop)</Typography>
                                            <Box sx={{ height: 350, border: '1px solid #ccc', borderRadius: 2, mb: 2, position: 'relative' }}>
                                                <ReactFlowProvider>
                                                    <ReactFlow
                                                        nodes={rfNodes}
                                                        edges={rfEdges}
                                                        onNodesChange={onNodesChange}
                                                        onEdgesChange={onEdgesChange}
                                                        onConnect={onConnect}
                                                        onNodeClick={onNodeClick}
                                                        fitView
                                                    >
                                                        <MiniMap />
                                                        <Controls />
                                                        <Background />
                                                    </ReactFlow>
                                                </ReactFlowProvider>
                                                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                                                    <Button size="small" variant="contained" onClick={() => setAddNodeOpen(true)}>
                                                        Schritt hinzufügen
                                                    </Button>
                                                    <Button size="small" variant="outlined" color="error" onClick={handleDeleteNode} disabled={!selectedNodeId}>
                                                        Schritt löschen
                                                    </Button>
                                                    <Button size="small" variant="outlined" onClick={handleUndo} disabled={historyIndex <= 0}>
                                                        Rückgängig
                                                    </Button>
                                                    <Button size="small" variant="outlined" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                                                        Wiederholen
                                                    </Button>
                                                </Box>
                                            </Box>
                                            <Button variant="outlined" onClick={rfToJson} sx={{ mt: 1 }}>
                                                Änderungen in JSON übernehmen
                                            </Button>
                                            {/* Dialog für neuen Schritt */}
                                            <Dialog open={addNodeOpen} onClose={() => setAddNodeOpen(false)}>
                                                <DialogTitle>Neuen Schritt hinzufügen</DialogTitle>
                                                <DialogContent>
                                                    <TextField
                                                        label="Name"
                                                        value={newNodeName}
                                                        onChange={e => setNewNodeName(e.target.value)}
                                                        fullWidth
                                                        sx={{ mb: 2 }}
                                                    />
                                                    <TextField
                                                        label="Typ"
                                                        value={newNodeType}
                                                        onChange={e => setNewNodeType(e.target.value)}
                                                        fullWidth
                                                        select
                                                    >
                                                        {nodeTypes.map(type => (
                                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={() => setAddNodeOpen(false)}>Abbrechen</Button>
                                                    <Button onClick={handleAddNode} disabled={!newNodeName}>Hinzufügen</Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    
                    <DialogActions>
                        <Button
                            onClick={() => setShowDetails(false)}
                        >
                            Schließen
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Dialog: Vorlage auswählen */}
                <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)}>
                    <DialogTitle>Workflow-Vorlage auswählen</DialogTitle>
                    <DialogContent>
                        <Select
                            value={selectedTemplate ?? ''}
                            onChange={e => handleTemplateSelect(e.target.value as string)}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="" disabled>Bitte wählen…</MenuItem>
                            {workflowTemplates.map(t => (
                                <MenuItem key={t.label} value={t.label}>{t.label}</MenuItem>
                            ))}
                        </Select>
                        {selectedTemplate && (
                            <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 8 }}>
                                {JSON.stringify(workflowTemplates.find(t => t.label === selectedTemplate)?.json, null, 2)}
                            </pre>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTemplateDialogOpen(false)}>Abbrechen</Button>
                    </DialogActions>
                </Dialog>
                {/* Dialog: Hilfe zur Vorlage */}
                <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
                    <DialogTitle>Hilfe: Eigene Workflows erstellen</DialogTitle>
                    <DialogContent>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{helpTextDocstring}</pre>
                    </DialogContent>
                </Dialog>
                <Box display="flex" gap={2} mt={2}>
                    <Button variant="outlined" onClick={handleExportWorkflow}>
                        Workflow als Vorlage exportieren
                    </Button>
                    <label htmlFor="import-workflow-json">
                        <input
                            style={{ display: 'none' }}
                            id="import-workflow-json"
                            type="file"
                            accept="application/json"
                            onChange={handleImportWorkflow}
                        />
                        <Button variant="outlined" component="span">
                            Workflow-Vorlage importieren
                        </Button>
                    </label>
                    <Tooltip title="Hilfe zur Workflow-Erstellung">
                        <IconButton onClick={() => setHelpDialogOpen(true)}>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                {importError && (
                    <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>
                )}
                <Button variant="contained" color="secondary" onClick={() => setAssistantOpen(true)} sx={{ mt: 2 }}>
                    KI-Workflow-Assistent starten
                </Button>
                <Dialog open={assistantOpen} onClose={() => setAssistantOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>KI-Workflow-Assistent</DialogTitle>
                    <DialogContent dividers sx={{ minHeight: 300 }}>
                        <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                            {chatHistory.length === 0 && (
                                <Typography variant="body2" color="text.secondary">Beschreibe deinen gewünschten Workflow in natürlicher Sprache. Die KI stellt Rückfragen und generiert am Ende ein passendes Workflow-JSON.</Typography>
                            )}
                            {chatHistory.map((msg, idx) => (
                                <Box key={idx} sx={{ mb: 1, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    <Typography variant="body2" color={msg.role === 'user' ? 'primary' : 'secondary'}>
                                        <b>{msg.role === 'user' ? 'Du' : 'KI'}:</b> {msg.content}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        {assistantError && <Alert severity="error">{assistantError}</Alert>}
                        {assistantJson && (
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <Typography variant="subtitle2">Vorschlag der KI (JSON):</Typography>
                                <pre style={{ maxHeight: 200, overflow: 'auto' }}>{assistantJson}</pre>
                                <Button variant="contained" color="success" onClick={handleAdoptAssistantJson} sx={{ mt: 1 }}>
                                    Vorschlag übernehmen
                                </Button>
                            </Box>
                        )}
                        <Box display="flex" gap={1} mt={2}>
                            <TextField
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                                placeholder="Deine Frage oder Beschreibung..."
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                disabled={assistantLoading}
                            />
                            <Button onClick={handleSendChat} disabled={assistantLoading || !chatInput.trim()} variant="contained" endIcon={<SendIcon />}>
                                Senden
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
                <Box mt={4} p={2} bgcolor={theme.palette.grey[100]} borderRadius={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="h6" gutterBottom flexGrow={1}>
                            Optimierungsvorschläge (KI-basiert)
                        </Typography>
                        <Button onClick={fetchAutomationSuggestions}>Automatisierungsvorschläge abrufen</Button>
                    </Box>
                    {optimizationError && <Alert severity="error" sx={{ mt: 2 }}>{optimizationError}</Alert>}
                    {optimizationSuggestions.length > 0 ? (
                        <Box>
                            {optimizationSuggestions.map((s, i) => (
                                <Card key={i} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" color="primary">{s.suggestion}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{s.reason}</Typography>
                                        {s.metric && (
                                            <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
                                                <pre style={{ margin: 0 }}>{JSON.stringify(s.metric, null, 2)}</pre>
                                            </Box>
                                        )}
                                        <Box display="flex" gap={1}>
                                            <Button size="small" variant="outlined" color="primary" onClick={() => handleAdoptSuggestion(s)}>Vorschlag übernehmen</Button>
                                            <Button size="small" variant="outlined" color="success" onClick={() => handleSuggestionFeedback(s, 'helpful', i)}>Hilfreich</Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleSuggestionFeedback(s, 'not_helpful', i)}>Nicht hilfreich</Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Noch keine Vorschläge vorhanden.</Typography>
                    )}
                </Box>
                <MuiSnackbar
                    open={optimizationFeedbackSnackbar.open}
                    autoHideDuration={2500}
                    onClose={() => setOptimizationFeedbackSnackbar({open: false, message: ''})}
                    message={optimizationFeedbackSnackbar.message}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
                <Dialog open={adoptModalOpen} onClose={() => setAdoptModalOpen(false)}>
                    <DialogTitle>Vorschlag übernehmen</DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>{adoptSuggestion?.suggestion}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{adoptSuggestion?.reason}</Typography>
                        {adoptSuggestion && extractAutomationTarget(adoptSuggestion.suggestion) && (
                            (() => {
                                // Vorschau der Änderung berechnen
                                let preview = '';
                                try {
                                    const json = JSON.parse(langGraphJson);
                                    const stepName = extractAutomationTarget(adoptSuggestion.suggestion);
                                    const before = json.steps?.find((s: any) => s.name === stepName);
                                    if (before && before.type === 'human') {
                                        const after = { ...before, type: 'operation' };
                                        preview = `Typ von Schritt '${stepName}' wird von 'human' auf 'operation' geändert.`;
                                    }
                                } catch {}
                                return preview ? <Alert severity="info" sx={{ mb: 1 }}>{preview}</Alert> : null;
                            })()
                        )}
                        <MuiTextField
                            label="Optionaler Kommentar"
                            value={adoptComment}
                            onChange={e => setAdoptComment(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                            sx={{ mb: 2 }}
                        />
                        {adoptSuggestion && extractStepName(adoptSuggestion.suggestion) && (
                            <Alert severity="info" sx={{ mb: 1 }}>
                                Schritt <b>{extractStepName(adoptSuggestion.suggestion)}</b> wird im Editor markiert.
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAdoptModalOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleConfirmAdopt} variant="contained">Übernehmen</Button>
                    </DialogActions>
                </Dialog>
                <MuiSnackbar
                    open={adoptSnackbar.open}
                    autoHideDuration={2500}
                    onClose={() => setAdoptSnackbar({open: false, message: ''})}
                    message={adoptSnackbar.message}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
                <Box mt={4} p={2} bgcolor={theme.palette.grey[100]} borderRadius={2}>
                    <Typography variant="h6" gutterBottom>Übernommene Optimierungsvorschläge</Typography>
                    {getWorkflowComments().length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Noch keine Vorschläge übernommen.</Typography>
                    ) : (
                        <Box>
                            {getWorkflowComments().map((c: any, i: number) => (
                                <Card key={i} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" color="primary">{c.text}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{c.reason}</Typography>
                                        {c.userComment && <Typography variant="body2" sx={{ mb: 1 }}>Kommentar: {c.userComment}</Typography>}
                                        <Typography variant="caption" color="text.secondary">{c.timestamp && new Date(c.timestamp).toLocaleString()}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default WorkflowManager; 