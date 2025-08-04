# VALEO NeuroERP 2.0 - Warenwirtschaft Verbesserungsvorschläge

## 🎯 Praktikabilitäts-Optimierung der Masken

### 1. Artikelverwaltung - Verbesserte Masken

#### 1.1 Schnellerfassung für Artikelanlage

```tsx
// components/articles/QuickArticleCreate.tsx
import React from 'react';
import { 
  Dialog, 
  TextField, 
  Grid, 
  Box,
  Autocomplete,
  InputAdornment 
} from '@mui/material';
import { useHotkeys } from 'react-hotkeys-hook';

export const QuickArticleCreate: React.FC = () => {
  const [barcodeMode, setBarcodeMode] = useState(false);
  
  // Keyboard Shortcuts
  useHotkeys('ctrl+n', () => openQuickCreate());
  useHotkeys('f2', () => focusBarcode());
  useHotkeys('tab', () => nextField(), { enableOnFormTags: true });
  useHotkeys('shift+tab', () => previousField(), { enableOnFormTags: true });
  useHotkeys('ctrl+s', () => saveArticle());
  useHotkeys('ctrl+d', () => duplicateLastArticle());
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Barcode Scanner Mode */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          autoFocus
          placeholder="EAN scannen oder eingeben (F2)"
          InputProps={{
            startAdornment: <BarcodeIcon />,
            endAdornment: barcodeMode && <PulsingDot />
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchArticleByEAN(e.target.value);
            }
          }}
        />
        <ToggleButton 
          value="scan" 
          selected={barcodeMode}
          onChange={() => setBarcodeMode(!barcodeMode)}
        >
          Scanner-Modus
        </ToggleButton>
      </Box>

      {/* Kompakte Eingabemaske */}
      <Grid container spacing={1}>
        <Grid item xs={8}>
          <TextField
            size="small"
            label="Bezeichnung"
            required
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={openAIAssist}>
                  <AutoAwesomeIcon />
                </IconButton>
              )
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            size="small"
            options={categories}
            label="Kategorie"
            freeSolo
            onInputChange={(e, value) => {
              if (!categories.includes(value)) {
                createNewCategory(value);
              }
            }}
          />
        </Grid>
      </Grid>

      {/* Preise in einer Zeile */}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          size="small"
          label="EK"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>
          }}
          sx={{ width: 100 }}
        />
        <TextField
          size="small"
          label="VK"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>
          }}
          sx={{ width: 100 }}
          onChange={calculateMargin}
        />
        <Chip 
          label={`Marge: ${margin}%`} 
          color={margin > 30 ? 'success' : 'warning'}
        />
      </Box>

      {/* Smart Actions */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ContentCopyIcon />} onClick={duplicateArticle}>
          Duplizieren (Ctrl+D)
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={saveAndNew}>
            Speichern & Neu
          </Button>
          <Button variant="contained" onClick={saveArticle}>
            Speichern (Ctrl+S)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
```

#### 1.2 Erweiterte Suchfunktionen

```tsx
// components/articles/AdvancedArticleSearch.tsx
export const AdvancedArticleSearch: React.FC = () => {
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  const [savedSearches, setSavedSearches] = useState([]);
  
  return (
    <Paper sx={{ p: 2 }}>
      {/* Suche mit Vorschlägen */}
      <Autocomplete
        freeSolo
        options={searchSuggestions}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Artikel suchen... (F3)"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon />,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={20} />}
                  <IconButton onClick={() => setSearchMode('advanced')}>
                    <TuneIcon />
                  </IconButton>
                </>
              )
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box {...props}>
            <ListItemIcon>
              {option.type === 'article' && <InventoryIcon />}
              {option.type === 'category' && <CategoryIcon />}
              {option.type === 'supplier' && <BusinessIcon />}
            </ListItemIcon>
            <ListItemText
              primary={option.label}
              secondary={option.description}
            />
            {option.stock && (
              <Chip 
                size="small" 
                label={`Bestand: ${option.stock}`}
                color={option.stock < option.minStock ? 'error' : 'default'}
              />
            )}
          </Box>
        )}
      />

      {/* Erweiterte Suche */}
      <Collapse in={searchMode === 'advanced'}>
        <Box sx={{ mt: 2 }}>
          {/* Facettierte Filter */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Schnellfilter</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Unter Mindestbestand" onClick={() => addFilter('lowStock')} />
                <Chip label="Ohne EAN" onClick={() => addFilter('noEAN')} />
                <Chip label="Ohne Preis" onClick={() => addFilter('noPrice')} />
                <Chip label="Inaktiv" onClick={() => addFilter('inactive')} />
                <Chip label="Mit Varianten" onClick={() => addFilter('hasVariants')} />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <PriceRangeSlider label="Verkaufspreis" />
            </Grid>
            <Grid item xs={6}>
              <StockRangeSlider label="Lagerbestand" />
            </Grid>

            <Grid item xs={12}>
              <MultiSelect
                label="Kategorien"
                options={categories}
                onChange={handleCategoryFilter}
              />
            </Grid>
          </Grid>

          {/* Gespeicherte Suchen */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Gespeicherte Suchen</Typography>
            <List dense>
              {savedSearches.map(search => (
                <ListItem
                  key={search.id}
                  secondaryAction={
                    <IconButton onClick={() => deleteSearch(search.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => loadSearch(search)}>
                    <ListItemIcon>
                      <BookmarkIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={search.name}
                      secondary={`${search.resultCount} Artikel`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Button 
              startIcon={<AddIcon />} 
              onClick={saveCurrentSearch}
              disabled={!hasActiveFilters}
            >
              Aktuelle Suche speichern
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};
```

### 2. Wareneingang - Mobile-First Design

```tsx
// components/warehouse/MobileGoodsReceipt.tsx
export const MobileGoodsReceipt: React.FC = () => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [positions, setPositions] = useState<ReceiptPosition[]>([]);
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header mit Lieferanteninfo */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Wareneingang</Typography>
            <Typography variant="caption">
              {supplier?.name || 'Lieferant wählen'}
            </Typography>
          </Box>
          <IconButton onClick={toggleScanMode}>
            {scanMode === 'camera' ? <KeyboardIcon /> : <CameraAltIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Scanner oder manuelle Eingabe */}
      <Box sx={{ p: 2 }}>
        {scanMode === 'camera' ? (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            style={{ width: '100%', height: 200 }}
          />
        ) : (
          <TextField
            fullWidth
            placeholder="EAN oder Artikelnummer"
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleManualSearch}>
                  <SearchIcon />
                </IconButton>
              )
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualSearch(e.target.value);
              }
            }}
          />
        )}
      </Box>

      {/* Erfasste Positionen */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <List>
          {positions.map((pos, index) => (
            <SwipeableListItem
              key={index}
              onSwipeLeft={() => decreaseQuantity(index)}
              onSwipeRight={() => increaseQuantity(index)}
              onDelete={() => removePosition(index)}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={pos.article.image} />
                </ListItemAvatar>
                <ListItemText
                  primary={pos.article.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        EAN: {pos.article.ean}
                      </Typography>
                      {pos.batchRequired && (
                        <Chip 
                          size="small" 
                          label={pos.batch || 'Charge erfassen'}
                          onClick={() => openBatchDialog(index)}
                          color={pos.batch ? 'success' : 'warning'}
                        />
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={() => decreaseQuantity(index)}>
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={pos.quantity}
                    onChange={(e) => updateQuantity(index, e.target.value)}
                    sx={{ width: 60, mx: 1 }}
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <IconButton onClick={() => increaseQuantity(index)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </ListItem>
            </SwipeableListItem>
          ))}
        </List>
      </Box>

      {/* Action Buttons */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={openPhotoCapture}
            >
              Lieferschein
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined"
              color="error"
              startIcon={<ReportProblemIcon />}
              onClick={openComplaintDialog}
            >
              Reklamation
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleBookReceipt}
              disabled={positions.length === 0}
            >
              Wareneingang buchen ({positions.length} Positionen)
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
```

### 3. Kommissionierung - Optimierte Pickliste

```tsx
// components/warehouse/OptimizedPickingList.tsx
export const OptimizedPickingList: React.FC = () => {
  const [route, setRoute] = useState<PickingRoute>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  return (
    <Box sx={{ height: '100vh', bgcolor: 'grey.100' }}>
      {/* Progress Header */}
      <Paper sx={{ p: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={(currentPosition / route?.positions.length) * 100}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">
            Position {currentPosition + 1} von {route?.positions.length}
          </Typography>
          <Typography variant="body2">
            Gesamtweg: {route?.totalDistance}m | Zeit: {route?.estimatedTime}min
          </Typography>
        </Box>
      </Paper>

      {/* Lagerplatz-Navigation */}
      <Paper sx={{ m: 2, p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h3" align="center">
          {route?.positions[currentPosition]?.location}
        </Typography>
        <Typography variant="body1" align="center">
          {route?.positions[currentPosition]?.zone} - Gang {route?.positions[currentPosition]?.aisle}
        </Typography>
        
        {/* Visual Navigation Hints */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <NavigationMap 
            currentLocation={route?.positions[currentPosition]?.location}
            nextLocation={route?.positions[currentPosition + 1]?.location}
          />
        </Box>
      </Paper>

      {/* Artikel-Info */}
      <Paper sx={{ m: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <img 
              src={route?.positions[currentPosition]?.article.image} 
              style={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={9}>
            <Typography variant="h6">
              {route?.positions[currentPosition]?.article.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Artikel-Nr: {route?.positions[currentPosition]?.article.number}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              EAN: {route?.positions[currentPosition]?.article.ean}
            </Typography>
            
            {/* Menge prominent */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" color="primary">
                {route?.positions[currentPosition]?.quantity}
              </Typography>
              <Typography variant="h6">
                {route?.positions[currentPosition]?.unit}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Besondere Hinweise */}
        {route?.positions[currentPosition]?.specialInstructions && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {route?.positions[currentPosition]?.specialInstructions}
          </Alert>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'white' }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentPosition === 0}
            >
              Zurück
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleShortage}
            >
              Fehlmenge
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleNext}
            >
              {currentPosition === route?.positions.length - 1 ? 'Abschließen' : 'Weiter'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
```

### 4. Druckvorlagen-System

```tsx
// components/printing/TemplateManager.tsx
export const PrintTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  return (
    <Grid container spacing={3}>
      {/* Template-Liste */}
      <Grid item xs={4}>
        <Paper sx={{ p: 2, height: '80vh', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Druckvorlagen</Typography>
            <Button startIcon={<AddIcon />} onClick={createNewTemplate}>
              Neu
            </Button>
          </Box>
          
          <List>
            {templates.map(template => (
              <ListItem
                key={template.id}
                selected={selectedTemplate?.id === template.id}
                onClick={() => setSelectedTemplate(template)}
              >
                <ListItemIcon>
                  {getTemplateIcon(template.type)}
                </ListItemIcon>
                <ListItemText
                  primary={template.name}
                  secondary={`${template.type} - ${template.format}`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => duplicateTemplate(template)}>
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteTemplate(template.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Template-Editor */}
      <Grid item xs={8}>
        <Paper sx={{ p: 2, height: '80vh', overflow: 'auto' }}>
          {selectedTemplate ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                  value={selectedTemplate.name}
                  onChange={(e) => updateTemplate({ name: e.target.value })}
                  variant="standard"
                  sx={{ fontSize: '1.5rem' }}
                />
                <Box>
                  <Button onClick={saveTemplate}>Speichern</Button>
                  <Button onClick={previewTemplate}>Vorschau</Button>
                  <Button onClick={testPrint}>Testdruck</Button>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tab label="Layout" />
                <Tab label="Felder" />
                <Tab label="Styles" />
                <Tab label="Drucker" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                {/* Layout-Editor mit Drag & Drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Paper sx={{ p: 2, minHeight: 400 }}>
                        <TemplateCanvas
                          template={selectedTemplate}
                          onFieldClick={selectField}
                          onFieldResize={resizeField}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Droppable droppableId="fields">
                        {(provided) => (
                          <List {...provided.droppableProps} ref={provided.innerRef}>
                            {availableFields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided) => (
                                  <ListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <ListItemIcon>
                                      <DragIndicatorIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={field.label} />
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </List>
                        )}
                      </Droppable>
                    </Grid>
                  </Grid>
                </DragDropContext>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {/* Feldkonfiguration */}
                <FieldConfigurator
                  fields={selectedTemplate.fields}
                  onChange={updateFields}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                {/* CSS-Editor */}
                <MonacoEditor
                  language="css"
                  value={selectedTemplate.styles}
                  onChange={updateStyles}
                  height="400px"
                  theme="vs-light"
                />
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                {/* Drucker-Einstellungen */}
                <PrinterSettings
                  settings={selectedTemplate.printerSettings}
                  onChange={updatePrinterSettings}
                />
              </TabPanel>
            </>
          ) : (
            <EmptyState
              icon={<PrintIcon />}
              title="Keine Vorlage ausgewählt"
              description="Wählen Sie eine Vorlage aus oder erstellen Sie eine neue"
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
```

### 5. Performance-Optimierungen

```typescript
// hooks/useOptimizedDataTable.ts
export const useOptimizedDataTable = (endpoint: string, options: TableOptions) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => options.rowHeight || 50,
    overscan: 5,
  });

  // Intelligentes Prefetching
  useEffect(() => {
    const prefetchNextPage = async () => {
      const scrollPercentage = (virtualizer.scrollOffset / virtualizer.getTotalSize()) * 100;
      if (scrollPercentage > 70 && !loading) {
        await loadNextPage();
      }
    };

    const scrollElement = parentRef.current;
    scrollElement?.addEventListener('scroll', prefetchNextPage);
    return () => scrollElement?.removeEventListener('scroll', prefetchNextPage);
  }, [virtualizer.scrollOffset]);

  // Optimistic Updates
  const updateRow = useCallback((rowId: string, updates: Partial<Row>) => {
    // Update local state immediately
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, ...updates } : row
    ));

    // Sync with server in background
    api.updateRow(rowId, updates).catch(() => {
      // Rollback on error
      queryClient.invalidateQueries([endpoint]);
      toast.error('Änderung konnte nicht gespeichert werden');
    });
  }, []);

  return {
    data,
    loading,
    virtualizer,
    updateRow,
  };
};
```

## 📱 Mobile App Integration

```typescript
// mobile/screens/WarehouseScreen.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export const WarehouseApp = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Scan" 
        component={ScannerScreen}
        options={{
          tabBarIcon: ({ color }) => <BarcodeIcon color={color} />,
          tabBarBadge: pendingScans > 0 ? pendingScans : undefined,
        }}
      />
      <Tab.Screen 
        name="Eingang" 
        component={GoodsReceiptScreen}
        options={{
          tabBarIcon: ({ color }) => <InboxIcon color={color} />,
        }}
      />
      <Tab.Screen 
        name="Kommissionierung" 
        component={PickingScreen}
        options={{
          tabBarIcon: ({ color }) => <ShoppingCartIcon color={color} />,
          tabBarBadge: openPickingLists,
        }}
      />
      <Tab.Screen 
        name="Inventur" 
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color }) => <InventoryIcon color={color} />,
        }}
      />
      <Tab.Screen 
        name="Mehr" 
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color }) => <MoreIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
```

## 🚀 Sofortmaßnahmen

1. **Keyboard-Navigation** in allen Masken implementieren
2. **Bulk-Import/Export** für Artikelstammdaten
3. **Scanner-Integration** via WebUSB API
4. **Offline-Fähigkeit** für Lagerprozesse
5. **Push-Notifications** für kritische Bestandsmeldungen