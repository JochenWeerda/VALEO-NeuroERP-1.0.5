import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FormProvider, useForm } from 'react-hook-form';
import {
  StandardTextField,
  StandardSelectField,
  StandardButton,
  FormActions,
  FormMessage,
  useFormValidation,
  FORM_LABELS
} from '../FormStandardization';

// Test-Theme erstellen
const theme = createTheme();

// Test-Form-Provider
const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithThemeAndForm = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <TestFormProvider>
        {component}
      </TestFormProvider>
    </ThemeProvider>
  );
};

describe('Form Standardization', () => {
  describe('StandardTextField', () => {
    it('sollte Textfeld mit Label rendern', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
        />
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('sollte required Feld markieren', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
          required
        />
      );
      const input = screen.getByLabelText('Test Label *');
      expect(input).toBeInTheDocument();
    });

    it('sollte placeholder anzeigen', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
          placeholder="Test Placeholder"
        />
      );
      expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
    });

    it('sollte helper text anzeigen', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
          helperText="Helper Text"
        />
      );
      expect(screen.getByText('Helper Text')).toBeInTheDocument();
    });

    it('sollte disabled Feld rendern', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
          disabled
        />
      );
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeDisabled();
    });

    it('sollte multiline Feld rendern', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
          multiline
          rows={3}
        />
      );
      const textarea = screen.getByLabelText('Test Label');
      expect(textarea).toBeInTheDocument();
    });

    it('sollte password Feld mit Toggle rendern', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Password"
          type="password"
        />
      );
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('sollte clear button anzeigen wenn aktiviert', () => {
      renderWithThemeAndForm(
        <StandardTextField
          name="test"
          label="Test Label"
          showClearButton
        />
      );
      const input = screen.getByLabelText('Test Label');
      fireEvent.change(input, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('StandardSelectField', () => {
    it('sollte Select-Feld mit Label rendern', () => {
      renderWithThemeAndForm(
        <StandardSelectField
          name="test"
          label="Test Label"
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]}
        />
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('sollte required Select-Feld markieren', () => {
      renderWithThemeAndForm(
        <StandardSelectField
          name="test"
          label="Test Label"
          required
          options={[
            { value: 'option1', label: 'Option 1' }
          ]}
        />
      );
      const select = screen.getByLabelText('Test Label *');
      expect(select).toBeInTheDocument();
    });

    it('sollte multiple Select-Feld rendern', () => {
      renderWithThemeAndForm(
        <StandardSelectField
          name="test"
          label="Test Label"
          multiple
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]}
        />
      );
      const select = screen.getByLabelText('Test Label');
      expect(select).toBeInTheDocument();
    });

    it('sollte disabled Optionen rendern', () => {
      renderWithThemeAndForm(
        <StandardSelectField
          name="test"
          label="Test Label"
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2', disabled: true }
          ]}
        />
      );
      const select = screen.getByLabelText('Test Label');
      expect(select).toBeInTheDocument();
    });
  });

  describe('StandardButton', () => {
    it('sollte Button mit Text rendern', () => {
      renderWithThemeAndForm(
        <StandardButton>Test Button</StandardButton>
      );
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('sollte verschiedene Varianten unterstützen', () => {
      const { rerender } = renderWithThemeAndForm(
        <StandardButton variant="contained">Contained</StandardButton>
      );
      expect(screen.getByText('Contained')).toBeInTheDocument();

      rerender(<StandardButton variant="outlined">Outlined</StandardButton>);
      expect(screen.getByText('Outlined')).toBeInTheDocument();

      rerender(<StandardButton variant="text">Text</StandardButton>);
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('sollte verschiedene Farben unterstützen', () => {
      const { rerender } = renderWithThemeAndForm(
        <StandardButton color="primary">Primary</StandardButton>
      );
      expect(screen.getByText('Primary')).toBeInTheDocument();

      rerender(<StandardButton color="secondary">Secondary</StandardButton>);
      expect(screen.getByText('Secondary')).toBeInTheDocument();

      rerender(<StandardButton color="success">Success</StandardButton>);
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('sollte loading State unterstützen', () => {
      renderWithThemeAndForm(
        <StandardButton loading>Loading Button</StandardButton>
      );
      const button = screen.getByText('Loading Button');
      expect(button).toBeDisabled();
    });

    it('sollte disabled State unterstützen', () => {
      renderWithThemeAndForm(
        <StandardButton disabled>Disabled Button</StandardButton>
      );
      const button = screen.getByText('Disabled Button');
      expect(button).toBeDisabled();
    });

    it('sollte onClick Handler unterstützen', () => {
      const handleClick = jest.fn();
      renderWithThemeAndForm(
        <StandardButton onClick={handleClick}>Clickable Button</StandardButton>
      );
      
      const button = screen.getByText('Clickable Button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormActions', () => {
    it('sollte Save-Button rendern', () => {
      const onSave = jest.fn();
      renderWithThemeAndForm(
        <FormActions onSave={onSave} />
      );
      expect(screen.getByText('Speichern')).toBeInTheDocument();
    });

    it('sollte Cancel-Button rendern', () => {
      const onCancel = jest.fn();
      renderWithThemeAndForm(
        <FormActions onCancel={onCancel} />
      );
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    });

    it('sollte Reset-Button rendern', () => {
      const onReset = jest.fn();
      renderWithThemeAndForm(
        <FormActions onReset={onReset} />
      );
      expect(screen.getByText('Zurücksetzen')).toBeInTheDocument();
    });

    it('sollte alle Buttons rendern', () => {
      const onSave = jest.fn();
      const onCancel = jest.fn();
      const onReset = jest.fn();
      
      renderWithThemeAndForm(
        <FormActions
          onSave={onSave}
          onCancel={onCancel}
          onReset={onReset}
        />
      );
      
      expect(screen.getByText('Speichern')).toBeInTheDocument();
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      expect(screen.getByText('Zurücksetzen')).toBeInTheDocument();
    });

    it('sollte custom Texte unterstützen', () => {
      renderWithThemeAndForm(
        <FormActions
          onSave={() => {}}
          saveText="Custom Save"
          cancelText="Custom Cancel"
          resetText="Custom Reset"
        />
      );
      
      expect(screen.getByText('Custom Save')).toBeInTheDocument();
      expect(screen.getByText('Custom Cancel')).toBeInTheDocument();
      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
    });

    it('sollte loading State unterstützen', () => {
      renderWithThemeAndForm(
        <FormActions
          onSave={() => {}}
          loading
        />
      );
      
      const saveButton = screen.getByText('Speichern');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('FormMessage', () => {
    it('sollte success Message rendern', () => {
      renderWithThemeAndForm(
        <FormMessage
          type="success"
          title="Erfolg"
          message="Operation erfolgreich"
        />
      );
      expect(screen.getByText('Erfolg')).toBeInTheDocument();
      expect(screen.getByText('Operation erfolgreich')).toBeInTheDocument();
    });

    it('sollte error Message rendern', () => {
      renderWithThemeAndForm(
        <FormMessage
          type="error"
          title="Fehler"
          message="Ein Fehler ist aufgetreten"
        />
      );
      expect(screen.getByText('Fehler')).toBeInTheDocument();
      expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
    });

    it('sollte warning Message rendern', () => {
      renderWithThemeAndForm(
        <FormMessage
          type="warning"
          title="Warnung"
          message="Bitte überprüfen Sie Ihre Eingaben"
        />
      );
      expect(screen.getByText('Warnung')).toBeInTheDocument();
      expect(screen.getByText('Bitte überprüfen Sie Ihre Eingaben')).toBeInTheDocument();
    });

    it('sollte info Message rendern', () => {
      renderWithThemeAndForm(
        <FormMessage
          type="info"
          title="Information"
          message="Hier finden Sie weitere Informationen"
        />
      );
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('Hier finden Sie weitere Informationen')).toBeInTheDocument();
    });

    it('sollte onClose Handler unterstützen', () => {
      const onClose = jest.fn();
      renderWithThemeAndForm(
        <FormMessage
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

  describe('useFormValidation', () => {
    it('sollte Form-Validierung zurückgeben', () => {
      const TestComponent = () => {
        const validation = useFormValidation();
        return (
          <div>
            <span data-testid="has-errors">{validation.hasErrors.toString()}</span>
            <span data-testid="is-valid">{validation.isValid.toString()}</span>
            <span data-testid="is-dirty">{validation.isDirty.toString()}</span>
          </div>
        );
      };

      renderWithThemeAndForm(<TestComponent />);
      expect(screen.getByTestId('has-errors')).toHaveTextContent('false');
      expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
      expect(screen.getByTestId('is-dirty')).toHaveTextContent('false');
    });
  });

  describe('FORM_LABELS', () => {
    it('sollte alle erforderlichen Labels enthalten', () => {
      expect(FORM_LABELS.SAVE).toBe('Speichern');
      expect(FORM_LABELS.CANCEL).toBe('Abbrechen');
      expect(FORM_LABELS.RESET).toBe('Zurücksetzen');
      expect(FORM_LABELS.DELETE).toBe('Löschen');
      expect(FORM_LABELS.EDIT).toBe('Bearbeiten');
      expect(FORM_LABELS.VIEW).toBe('Anzeigen');
    });

    it('sollte deutsche Labels verwenden', () => {
      expect(FORM_LABELS.NAME).toBe('Name');
      expect(FORM_LABELS.EMAIL).toBe('E-Mail');
      expect(FORM_LABELS.PHONE).toBe('Telefon');
      expect(FORM_LABELS.ADDRESS).toBe('Adresse');
    });
  });

  describe('Integration Tests', () => {
    it('sollte vollständiges Formular rendern', () => {
      renderWithThemeAndForm(
        <div>
          <StandardTextField
            name="name"
            label="Name"
            required
          />
          <StandardSelectField
            name="status"
            label="Status"
            options={[
              { value: 'active', label: 'Aktiv' },
              { value: 'inactive', label: 'Inaktiv' }
            ]}
          />
          <FormActions
            onSave={() => console.log('Save')}
            onCancel={() => console.log('Cancel')}
          />
        </div>
      );

      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByText('Speichern')).toBeInTheDocument();
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    });

    it('sollte Formular-Validierung funktionieren', async () => {
      renderWithThemeAndForm(
        <div>
          <StandardTextField
            name="email"
            label="E-Mail"
            required
          />
          <FormActions onSave={() => {}} />
        </div>
      );

      const emailInput = screen.getByLabelText('E-Mail *');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('E-Mail ist erforderlich')).toBeInTheDocument();
      });
    });
  });
}); 