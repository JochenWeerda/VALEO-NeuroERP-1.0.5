import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  it('rendert verschiedene Varianten ohne Fehler', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button', { name: 'Danger' })).toBeInTheDocument();
  });

  it('rendert Button mit Icon korrekt', () => {
    render(<Button icon="plus">Mit Icon</Button>);
    expect(screen.getByText('Mit Icon')).toBeInTheDocument();
    // Icon-Test würde hier implementiert werden
  });

  it('rendert verschiedene Größen ohne Fehler', () => {
    const { rerender } = render(<Button size="sm">Klein</Button>);
    expect(screen.getByRole('button', { name: 'Klein' })).toBeInTheDocument();

    rerender(<Button size="lg">Groß</Button>);
    expect(screen.getByRole('button', { name: 'Groß' })).toBeInTheDocument();
  });
}); 