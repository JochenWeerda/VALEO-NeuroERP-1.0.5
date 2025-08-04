import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { ApiProvider } from '../../contexts/ApiContext';
import Layout from '../Layout';

// Mock für die Theme
const theme = createTheme();

// Wrapper für Tests mit Router, Theme und ApiProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ApiProvider>
          {component}
        </ApiProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  it('rendert Layout-Komponente korrekt', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('rendert Sidebar-Navigation', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    // Prüfe ob Navigation-Elemente vorhanden sind
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('rendert Main Content Area', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('rendert Header-Bereich', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    // Prüfe ob Header-Elemente vorhanden sind
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('rendert Layout-Struktur korrekt', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    // Prüfe ob Layout-Struktur vorhanden ist
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wendet korrekte CSS-Klassen an', () => {
    const { container } = renderWithProviders(<Layout><div>Test Content</div></Layout>);
    const layoutElement = container.firstChild;
    expect(layoutElement).toHaveClass('MuiBox-root');
  });

  it('rendert mit verschiedenen Kindern korrekt', () => {
    renderWithProviders(
      <Layout>
        <div>Erstes Kind</div>
        <div>Zweites Kind</div>
      </Layout>
    );
    expect(screen.getByText('Erstes Kind')).toBeInTheDocument();
    expect(screen.getByText('Zweites Kind')).toBeInTheDocument();
  });

  it('behält Layout-Struktur bei', () => {
    const { container } = renderWithProviders(<Layout><div>Test Content</div></Layout>);
    // Prüfe ob die grundlegende Layout-Struktur vorhanden ist
    expect(container.firstChild).toBeInTheDocument();
  });
}); 