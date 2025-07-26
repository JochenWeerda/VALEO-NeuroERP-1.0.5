import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  FileCopy as FileCopyIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import {
  ObjectPageHeader
} from '../components/ui/NeuroFlowComponents';

interface DocumentFormData {
  name: string;
  type: string;
  content: string;
}

const DocumentsPage: React.FC = () => {
  const {
    documents,
    getDocuments,
    uploadDocument,
    isLoading,
    error
  } = useApi();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    type: 'document',
    content: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    await getDocuments();
  };

  const handleSubmit = async (formData: DocumentFormData) => {
    try {
      if (editingDocument) {
        console.log('Update document:', editingDocument.id, formData);
      } else {
        const file = new File([''], formData.name, { type: 'text/plain' });
        await uploadDocument(file, {
          ...formData,
          user_id: 'current-user-id' // TODO: Get from context
        });
      }
      setOpenDialog(false);
      resetForm();
      loadDocuments();
    } catch (err) {
      console.error('Error saving document:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      // TODO: Implement deleteDocument
      console.log('Delete document:', id);
      loadDocuments();
    }
  };

  const handleEdit = (document: any) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      type: document.type,
      content: document.content
    });
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setFormData({
      name: '',
      type: 'document',
      content: ''
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'document',
      content: ''
    });
    setEditingDocument(null);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <PdfIcon color="error" />;
      case 'image': return <ImageIcon color="primary" />;
      case 'text': return <DescriptionIcon color="info" />;
      default: return <FileIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'error';
      case 'image': return 'primary';
      case 'text': return 'info';
      default: return 'default';
    }
  };

  const totalDocuments = filteredDocuments.length;
  const pdfDocuments = filteredDocuments.filter(doc => doc.type === 'pdf').length;
  const imageDocuments = filteredDocuments.filter(doc => doc.type === 'image').length;
  const textDocuments = filteredDocuments.filter(doc => doc.type === 'text').length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      {/* Header */}
      <ObjectPageHeader
        title="Dokumentenverwaltung"
        subtitle="Zentrale Verwaltung aller Dokumente und Dateien"
        status="Live-Daten"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadDocuments}
              disabled={isLoading}
            >
              Aktualisieren
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Neues Dokument
            </Button>
          </Box>
        }
      />

      {/* Error Display */}
      {error && (
        <Box sx={{ px: 3 }}>
          <Typography variant="body1" color="error">{error}</Typography>
        </Box>
      )}

      {/* Action Bar */}
      <Box sx={{ p: 3 }}>
        {/* Summary Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon sx={{ fontSize: 40, color: '#0A6ED1' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#0A6ED1', fontWeight: 600 }}>
                  {totalDocuments}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Gesamte Dokumente
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PdfIcon sx={{ fontSize: 40, color: '#BB0000' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#BB0000', fontWeight: 600 }}>
                  {pdfDocuments}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  PDF-Dokumente
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ImageIcon sx={{ fontSize: 40, color: '#107C41' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#107C41', fontWeight: 600 }}>
                  {imageDocuments}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Bilder
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FileIcon sx={{ fontSize: 40, color: '#E9730C' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#E9730C', fontWeight: 600 }}>
                  {textDocuments}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Text-Dokumente
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                Filter
              </Typography>
              
              <TextField
                label="Suche"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Typ"
                >
                  <MenuItem value="all">Alle Typen</MenuItem>
                  <MenuItem value="document">Dokument</MenuItem>
                  <MenuItem value="report">Bericht</MenuItem>
                  <MenuItem value="contract">Vertrag</MenuItem>
                  <MenuItem value="invoice">Rechnung</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                size="small"
              >
                Filter zurücksetzen
              </Button>
            </Box>
          </Card>
        </Box>

        {/* Documents List */}
        <Card>
          <List>
            {filteredDocuments.map((document) => (
              <ListItem key={document.id} divider>
                <ListItemIcon>
                  {getTypeIcon(document.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {document.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={document.type}
                          size="small"
                          color={getTypeColor(document.type) as any}
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {document.content.substring(0, 100)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Erstellt: {new Date(document.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Anzeigen">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Herunterladen">
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kopieren">
                      <IconButton size="small">
                        <FileCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bearbeiten">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(document)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(document.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {filteredDocuments.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Keine Dokumente gefunden
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Card>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDocument ? 'Dokument bearbeiten' : 'Neues Dokument'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Dokumentname"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />

            <Box className="grid grid-cols-1 gap-4">
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Typ"
                >
                  <MenuItem value="document">Dokument</MenuItem>
                  <MenuItem value="report">Bericht</MenuItem>
                  <MenuItem value="contract">Vertrag</MenuItem>
                  <MenuItem value="invoice">Rechnung</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Inhalt"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              multiline
              rows={8}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button onClick={() => handleSubmit(formData)} variant="contained">
            {editingDocument ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default DocumentsPage; 