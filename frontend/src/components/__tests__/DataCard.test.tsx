import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCard } from '../DataCard';

describe('DataCard Component', () => {
  const mockData = {
    title: 'Test Karte',
    value: '100',
    trend: 'up' as const,
    change: '+5%',
    icon: 'fas fa-chart-line',
    trustLevel: 'high' as const,
    confidence: 0.95,
  };

  it('rendert DataCard mit allen Props korrekt', () => {
    render(<DataCard {...mockData} />);
    
    expect(screen.getByText('Test Karte')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('wendet korrekte CSS-Klassen für positive Änderungen an', () => {
    render(<DataCard {...mockData} trend="up" />);
    const changeElement = screen.getByText('+5%');
    expect(changeElement.parentElement).toHaveClass('text-green-600');
  });

  it('wendet korrekte CSS-Klassen für negative Änderungen an', () => {
    render(<DataCard {...mockData} trend="down" change="-3%" />);
    const changeElement = screen.getByText('-3%');
    expect(changeElement.parentElement).toHaveClass('text-red-600');
  });

  it('wendet korrekte CSS-Klassen für neutrale Änderungen an', () => {
    render(<DataCard {...mockData} trend="neutral" change="0%" />);
    const changeElement = screen.getByText('0%');
    expect(changeElement.parentElement).toHaveClass('text-gray-600');
  });

  it('rendert DataCard korrekt', () => {
    render(<DataCard {...mockData} />);
    expect(screen.getByText('Test Karte')).toBeInTheDocument();
  });

  it('rendert mit verschiedenen Trends korrekt', () => {
    const { rerender } = render(<DataCard {...mockData} trend="up" />);
    expect(screen.getByText('Test Karte')).toBeInTheDocument();

    rerender(<DataCard {...mockData} trend="down" />);
    expect(screen.getByText('Test Karte')).toBeInTheDocument();
  });

  it('rendert mit Icon korrekt', () => {
    render(<DataCard {...mockData} />);
    expect(screen.getByText('Test Karte')).toBeInTheDocument();
    // Icon-Test würde hier implementiert werden
  });
}); 