import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { Input } from '../Input';

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

describe('Input Component', () => {
  it('rendert Input mit Label korrekt', () => {
    renderWithTheme(<Input label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('rendert Input ohne Label korrekt', () => {
    renderWithTheme(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('ruft onChange Handler auf', () => {
    const handleChange = jest.fn();
    renderWithTheme(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('rendert Input mit Error korrekt', () => {
    renderWithTheme(<Input error="Test Error" />);
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('rendert Input mit Helper-Text korrekt', () => {
    renderWithTheme(<Input helperText="Test Helper" />);
    expect(screen.getByText('Test Helper')).toBeInTheDocument();
  });

  it('wendet verschiedene Varianten korrekt an', () => {
    const { rerender } = renderWithTheme(<Input variant="default" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    rerender(<Input variant="agent" />);
    const agentInput = screen.getByRole('textbox');
    expect(agentInput).toBeInTheDocument();
  });

  it('rendert Input mit Icon korrekt', () => {
    renderWithTheme(<Input icon="fas fa-search" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('wendet korrekte CSS-Klassen an', () => {
    const { container } = renderWithTheme(<Input className="custom-class" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('behält Input-Wert bei', () => {
    renderWithTheme(<Input value="Test Value" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Test Value');
  });

  it('rendert Input mit verschiedenen Typen korrekt', () => {
    const { rerender } = renderWithTheme(<Input type="text" />);
    const textInput = screen.getByRole('textbox');
    expect(textInput).toBeInTheDocument();

    rerender(<Input type="email" />);
    const emailInput = screen.getByRole('textbox');
    expect(emailInput).toBeInTheDocument();
  });

  it('rendert Input mit Placeholder korrekt', () => {
    renderWithTheme(<Input placeholder="Test Placeholder" />);
    const input = screen.getByPlaceholderText('Test Placeholder');
    expect(input).toBeInTheDocument();
  });

  it('rendert Input mit verschiedenen Größen korrekt', () => {
    const { rerender } = renderWithTheme(<Input size={10} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.size).toBe(10);

    rerender(<Input size={20} />);
    const largeInput = screen.getByRole('textbox') as HTMLInputElement;
    expect(largeInput.size).toBe(20);
  });

  it('rendert Input mit verschiedenen Max-Length korrekt', () => {
    const { rerender } = renderWithTheme(<Input maxLength={10} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.maxLength).toBe(10);

    rerender(<Input maxLength={20} />);
    const largeInput = screen.getByRole('textbox') as HTMLInputElement;
    expect(largeInput.maxLength).toBe(20);
  });

  it('ruft onKeyDown Handler auf', () => {
    const handleKeyDown = jest.fn();
    renderWithTheme(<Input onKeyDown={handleKeyDown} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('rendert Input mit Icon korrekt', () => {
    renderWithTheme(<Input icon="fas fa-user" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
}); 