import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { Modal } from '../Modal';

// Mock für die Theme
const theme = createTheme();

// Wrapper für Tests mit Theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('rendert Modal mit Titel und Inhalt korrekt', () => {
    renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Inhalt')).toBeInTheDocument();
  });

  it('ruft onClose auf, wenn Close-Button geklickt wird', () => {
    renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ruft onClose auf, wenn Escape-Taste gedrückt wird', () => {
    renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ruft onClose auf, wenn außerhalb geklickt wird', () => {
    renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('rendert Modal nicht, wenn isOpen=false', () => {
    renderWithTheme(
      <Modal
        isOpen={false}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Inhalt')).not.toBeInTheDocument();
  });

  it('rendert Modal mit verschiedenen Größen korrekt', () => {
    const { rerender } = renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        size="sm"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();

    rerender(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        size="lg"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('rendert Modal ohne Titel korrekt', () => {
    renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.getByText('Modal Inhalt')).toBeInTheDocument();
  });

  it('behält Modal-Status bei', () => {
    const { rerender } = renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();

    rerender(
      <Modal
        isOpen={false}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Inhalt</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });
}); 