import Dashboard from './pages/Dashboard';
import ThemeDemo from './pages/ThemeDemo';
import NotificationCenter from './pages/NotificationCenter';
import ThemeSettings from './pages/ThemeSettings';
import ArticleMasterData from './pages/inventory/ArticleMasterData';
import Layout from './pages/Layout';
import EmergencyDashboard from './pages/EmergencyDashboard';

const routes = [
  {
    path: '/theme-demo',
    element: <ThemeDemo />,
    requiresAuth: false,
  },
  {
    path: '/inventory',
    element: <Layout />,
    children: [
      { path: '', element: <Navigate to="/inventory/dashboard" /> },
      { path: 'dashboard', element: <EmergencyDashboard /> },  // Placeholder, replace with actual inventory dashboard
      { path: 'article-master-data', element: <ArticleMasterData /> },
      // ... other inventory routes ...
    ],
  },
]; 