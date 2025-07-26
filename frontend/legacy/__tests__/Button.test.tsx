import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('rendert Button mit Text korrekt', () => {
    render(<Button>Klick mich</Button>);
    expect(screen.getByText('Klick mich')).toBeInTheDocument();
  });

  it('ruft onClick Handler auf', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Klick mich</Button>);
    
    fireEvent.click(screen.getByText('Klick mich'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('rendert disabled Button korrekt', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  it('wendet verschiedene Varianten korrekt an', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toHaveClass('bg-danger-600');
  });

  it('rendert Button mit Icon korrekt', () => {
    render(<Button icon="plus">Mit Icon</Button>);
    expect(screen.getByText('Mit Icon')).toBeInTheDocument();
    // Icon-Test würde hier implementiert werden
  });

  it('wendet verschiedene Größen korrekt an', () => {
    const { rerender } = render(<Button size="sm">Klein</Button>);
    expect(screen.getByText('Klein')).toHaveClass('px-3 py-1.5 text-sm');

    rerender(<Button size="lg">Groß</Button>);
    expect(screen.getByText('Groß')).toHaveClass('px-6 py-3 text-base');
  });
}); 