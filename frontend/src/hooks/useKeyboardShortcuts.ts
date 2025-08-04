import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

interface ShortcutConfig {
  // Navigation
  'alt+d': () => void; // Dashboard
  'alt+k': () => void; // Kunden
  'alt+a': () => void; // Artikel
  'alt+r': () => void; // Rechnungen
  'alt+b': () => void; // Bestellungen
  
  // Aktionen
  'ctrl+n': () => void; // Neu erstellen
  'ctrl+s': () => void; // Speichern
  'ctrl+d': () => void; // Duplizieren
  'ctrl+p': () => void; // Drucken
  'ctrl+f': () => void; // Suchen
  'f3': () => void; // Erweiterte Suche
  'f2': () => void; // Barcode-Scanner
  'esc': () => void; // Abbrechen/Schließen
  
  // Bearbeitung
  'ctrl+z': () => void; // Rückgängig
  'ctrl+y': () => void; // Wiederholen
  'ctrl+x': () => void; // Ausschneiden
  'ctrl+c': () => void; // Kopieren
  'ctrl+v': () => void; // Einfügen
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  // Navigation Shortcuts
  useHotkeys('alt+d', () => navigate('/'), {
    enableOnFormTags: false,
    preventDefault: true,
  });

  useHotkeys('alt+k', () => navigate('/customers'), {
    enableOnFormTags: false,
    preventDefault: true,
  });

  useHotkeys('alt+a', () => navigate('/articles'), {
    enableOnFormTags: false,
    preventDefault: true,
  });

  useHotkeys('alt+r', () => navigate('/invoices'), {
    enableOnFormTags: false,
    preventDefault: true,
  });

  useHotkeys('alt+b', () => navigate('/orders'), {
    enableOnFormTags: false,
    preventDefault: true,
  });

  // Globale Suche
  useHotkeys('ctrl+f, f3', (e) => {
    e.preventDefault();
    const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, {
    enableOnFormTags: true,
  });

  // Context-spezifische Shortcuts
  const registerContextShortcuts = useCallback((shortcuts: Partial<ShortcutConfig>) => {
    const cleanup: (() => void)[] = [];

    Object.entries(shortcuts).forEach(([key, handler]) => {
      const unregister = useHotkeys.bind(null, key, handler, {
        enableOnFormTags: ['ctrl+s', 'ctrl+n'].includes(key),
        preventDefault: true,
      });
      cleanup.push(unregister);
    });

    return () => cleanup.forEach(fn => fn());
  }, []);

  return {
    registerContextShortcuts,
  };
};

// Shortcut-Hilfe Komponente
export const ShortcutHelp: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  useHotkeys('shift+?', () => setOpen(true), {
    enableOnFormTags: true,
  });

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: 'Alt + D', description: 'Dashboard' },
      { keys: 'Alt + K', description: 'Kunden' },
      { keys: 'Alt + A', description: 'Artikel' },
      { keys: 'Alt + R', description: 'Rechnungen' },
      { keys: 'Alt + B', description: 'Bestellungen' },
    ]},
    { category: 'Aktionen', items: [
      { keys: 'Ctrl + N', description: 'Neu erstellen' },
      { keys: 'Ctrl + S', description: 'Speichern' },
      { keys: 'Ctrl + D', description: 'Duplizieren' },
      { keys: 'Ctrl + P', description: 'Drucken' },
      { keys: 'F3', description: 'Suchen' },
      { keys: 'F2', description: 'Barcode-Scanner' },
    ]},
    { category: 'Bearbeitung', items: [
      { keys: 'Ctrl + Z', description: 'Rückgängig' },
      { keys: 'Ctrl + Y', description: 'Wiederholen' },
      { keys: 'Tab', description: 'Nächstes Feld' },
      { keys: 'Shift + Tab', description: 'Vorheriges Feld' },
    ]},
  ];

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        Tastenkürzel-Übersicht
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {shortcuts.map((section) => (
            <Grid item xs={12} md={4} key={section.category}>
              <Typography variant="h6" gutterBottom>
                {section.category}
              </Typography>
              <List dense>
                {section.items.map((shortcut) => (
                  <ListItem key={shortcut.keys}>
                    <ListItemText
                      primary={shortcut.description}
                      secondary={
                        <Chip
                          label={shortcut.keys}
                          size="small"
                          variant="outlined"
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
};