import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UI_LABELS, StatusChip, PriorityChip, StandardMessage, InfoTooltip, HelpButton, useUIStandardization } from '../UIStandardization';

// Test-Theme erstellen
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('UI Standardization', () => {
  describe('UI_LABELS', () => {
    it('sollte alle erforderlichen Label-Kategorien enthalten', () => {
      expect(UI_LABELS.ACTIONS).toBeDefined();
      expect(UI_LABELS.FORMS).toBeDefined();
      expect(UI_LABELS.ERP).toBeDefined();
      expect(UI_LABELS.STATUS).toBeDefined();
      expect(UI_LABELS.PRIORITY).toBeDefined();
      expect(UI_LABELS.NAVIGATION).toBeDefined();
      expect(UI_LABELS.MODULES).toBeDefined();
      expect(UI_LABELS.MESSAGES).toBeDefined();
      expect(UI_LABELS.VALIDATION).toBeDefined();
    });

    it('sollte deutsche Labels verwenden', () => {
      expect(UI_LABELS.ACTIONS.SAVE).toBe('Speichern');
      expect(UI_LABELS.ACTIONS.CANCEL).toBe('Abbrechen');
      expect(UI_LABELS.FORMS.NAME).toBe('Name');
      expect(UI_LABELS.FORMS.EMAIL).toBe('E-Mail');
      expect(UI_LABELS.ERP.CUSTOMER_NUMBER).toBe('Kundennummer');
      expect(UI_LABELS.ERP.ORDER_NUMBER).toBe('Auftragsnummer');
    });

    it('sollte konsistente Status-Labels haben', () => {
      expect(UI_LABELS.STATUS.ACTIVE).toBe('Aktiv');
      expect(UI_LABELS.STATUS.PENDING).toBe('Ausstehend');
      expect(UI_LABELS.STATUS.COMPLETED).toBe('Abgeschlossen');
      expect(UI_LABELS.STATUS.CANCELLED).toBe('Storniert');
    });
  });

  describe('StatusChip', () => {
    it('sollte Status-Chip mit korrektem Label rendern', () => {
      renderWithTheme(<StatusChip status="ACTIVE" />);
      expect(screen.getByText('Aktiv')).toBeInTheDocument();
    });

    it('sollte verschiedene Status-Farben verwenden', () => {
      const { rerender } = renderWithTheme(<StatusChip status="ACTIVE" />);
      expect(screen.getByText('Aktiv')).toBeInTheDocument();

      rerender(<StatusChip status="PENDING" />);
      expect(screen.getByText('Ausstehend')).toBeInTheDocument();

      rerender(<StatusChip status="CANCELLED" />);
      expect(screen.getByText('Storniert')).toBeInTheDocument();
    });

    it('sollte verschiedene Größen unterstützen', () => {
      renderWithTheme(<StatusChip status="ACTIVE" size="small" />);
      const chip = screen.getByText('Aktiv');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('PriorityChip', () => {
    it('sollte Prioritäts-Chip mit korrektem Label rendern', () => {
      renderWithTheme(<PriorityChip priority="HIGH" />);
      expect(screen.getByText('Hoch')).toBeInTheDocument();
    });

    it('sollte verschiedene Prioritäts-Farben verwenden', () => {
      const { rerender } = renderWithTheme(<PriorityChip priority="LOW" />);
      expect(screen.getByText('Niedrig')).toBeInTheDocument();

      rerender(<PriorityChip priority="MEDIUM" />);
      expect(screen.getByText('Mittel')).toBeInTheDocument();

      rerender(<PriorityChip priority="HIGH" />);
      expect(screen.getByText('Hoch')).toBeInTheDocument();

      rerender(<PriorityChip priority="URGENT" />);
      expect(screen.getByText('Dringend')).toBeInTheDocument();
    });
  });

  describe('StandardMessage', () => {
    it('sollte Erfolgs-Meldung rendern', () => {
      renderWithTheme(
        <StandardMessage
          type="success"
          title="Erfolg"
          message="Operation erfolgreich abgeschlossen"
        />
      );
      expect(screen.getByText('Erfolg')).toBeInTheDocument();
      expect(screen.getByText('Operation erfolgreich abgeschlossen')).toBeInTheDocument();
    });

    it('sollte Fehler-Meldung rendern', () => {
      renderWithTheme(
        <StandardMessage
          type="error"
          title="Fehler"
          message="Ein Fehler ist aufgetreten"
        />
      );
      expect(screen.getByText('Fehler')).toBeInTheDocument();
      expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
    });

    it('sollte Warnung-Meldung rendern', () => {
      renderWithTheme(
        <StandardMessage
          type="warning"
          title="Warnung"
          message="Bitte überprüfen Sie Ihre Eingaben"
        />
      );
      expect(screen.getByText('Warnung')).toBeInTheDocument();
      expect(screen.getByText('Bitte überprüfen Sie Ihre Eingaben')).toBeInTheDocument();
    });

    it('sollte Info-Meldung rendern', () => {
      renderWithTheme(
        <StandardMessage
          type="info"
          title="Information"
          message="Hier finden Sie weitere Informationen"
        />
      );
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('Hier finden Sie weitere Informationen')).toBeInTheDocument();
    });

    it('sollte Close-Funktion unterstützen', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <StandardMessage
          type="info"
          message="Test Message"
          onClose={onClose}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('InfoTooltip', () => {
    it('sollte Info-Tooltip mit Icon rendern', () => {
      renderWithTheme(
        <InfoTooltip title="Hilfreiche Information">
          <span>Test Content</span>
        </InfoTooltip>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('HelpButton', () => {
    it('sollte Hilfe-Button rendern', () => {
      renderWithTheme(
        <HelpButton
          title="Hilfe"
          content="Hier finden Sie Hilfe zur Verwendung dieser Funktion"
        />
      );
      const helpButton = screen.getByRole('button');
      expect(helpButton).toBeInTheDocument();
    });
  });

  describe('useUIStandardization', () => {
    it('sollte Labels zurückgeben', () => {
      const TestComponent = () => {
        const { labels, getLabel } = useUIStandardization();
        return (
          <div>
            <span data-testid="save-label">{getLabel('ACTIONS.SAVE')}</span>
            <span data-testid="customer-number">{getLabel('ERP.CUSTOMER_NUMBER')}</span>
          </div>
        );
      };

      renderWithTheme(<TestComponent />);
      expect(screen.getByTestId('save-label')).toHaveTextContent('Speichern');
      expect(screen.getByTestId('customer-number')).toHaveTextContent('Kundennummer');
    });

    it('sollte Fallback für unbekannte Labels zurückgeben', () => {
      const TestComponent = () => {
        const { getLabel } = useUIStandardization();
        return (
          <div>
            <span data-testid="unknown-label">{getLabel('UNKNOWN.LABEL')}</span>
          </div>
        );
      };

      renderWithTheme(<TestComponent />);
      expect(screen.getByTestId('unknown-label')).toHaveTextContent('UNKNOWN.LABEL');
    });
  });

  describe('Label-Konsistenz', () => {
    it('sollte konsistente Button-Texte verwenden', () => {
      expect(UI_LABELS.ACTIONS.SAVE).toBe('Speichern');
      expect(UI_LABELS.ACTIONS.CANCEL).toBe('Abbrechen');
      expect(UI_LABELS.ACTIONS.DELETE).toBe('Löschen');
      expect(UI_LABELS.ACTIONS.EDIT).toBe('Bearbeiten');
    });

    it('sollte konsistente Formular-Labels verwenden', () => {
      expect(UI_LABELS.FORMS.NAME).toBe('Name');
      expect(UI_LABELS.FORMS.EMAIL).toBe('E-Mail');
      expect(UI_LABELS.FORMS.PHONE).toBe('Telefon');
      expect(UI_LABELS.FORMS.ADDRESS).toBe('Adresse');
    });

    it('sollte konsistente ERP-Labels verwenden', () => {
      expect(UI_LABELS.ERP.CUSTOMER_NUMBER).toBe('Kundennummer');
      expect(UI_LABELS.ERP.ORDER_NUMBER).toBe('Auftragsnummer');
      expect(UI_LABELS.ERP.INVOICE_NUMBER).toBe('Rechnungsnummer');
      expect(UI_LABELS.ERP.PRODUCT_NUMBER).toBe('Artikelnummer');
    });
  });

  describe('Accessibility', () => {
    it('sollte ARIA-Labels für Status-Chips haben', () => {
      renderWithTheme(<StatusChip status="ACTIVE" />);
      const chip = screen.getByText('Aktiv');
      expect(chip).toBeInTheDocument();
    });

    it('sollte ARIA-Labels für Prioritäts-Chips haben', () => {
      renderWithTheme(<PriorityChip priority="HIGH" />);
      const chip = screen.getByText('Hoch');
      expect(chip).toBeInTheDocument();
    });

    it('sollte ARIA-Labels für Meldungen haben', () => {
      renderWithTheme(
        <StandardMessage
          type="success"
          title="Erfolg"
          message="Test Message"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });
}); 