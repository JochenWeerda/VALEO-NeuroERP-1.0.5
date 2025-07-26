import React from 'react';
import { render, screen } from '@testing-library/react';

const SimpleComponent: React.FC = () => {
  return <div data-testid="simple-component">Hello World</div>;
};

describe('Simple Test', () => {
  test('rendert eine einfache Komponente', () => {
    render(<SimpleComponent />);
    expect(screen.getByTestId('simple-component')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
}); 