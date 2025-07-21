# VALEO NeuroERP - Technische Architektur
## Trust-basierte Frontend-Implementierung

### 🏗️ Systemarchitektur

```
VALEO NeuroERP 2.0
├── Frontend (React + TypeScript)
│   ├── Trust-basierte UI-Komponenten
│   ├── Zustand-Management
│   ├── API-Integration
│   └── Responsive Design
├── Backend (Python + FastAPI)
│   ├── API-Gateway
│   ├── Trust-Validierung
│   ├── Audit-System
│   └── KI-Agenten
└── Middleware
    ├── LangGraph-Integration
    ├── Datenbank-Services
    └── Real-time Updates
```

### 📁 Dateistruktur

```
frontend/
├── src/
│   ├── components/
│   │   ├── TrustIndicator.tsx          # Zentrale Trust-Komponente
│   │   ├── Sidebar.tsx                 # Navigation mit Trust-Indikatoren
│   │   ├── NotificationDropdown.tsx    # Benachrichtigungen
│   │   ├── UserDropdown.tsx            # Benutzer-Profil
│   │   ├── TrustAwareLayout.tsx        # Haupt-Layout
│   │   ├── ModuleCard.tsx              # ERP-Modul-Karten
│   │   ├── ChatSidebar.tsx             # KI-Chat-System
│   │   ├── Button.tsx                  # Basis-UI-Komponenten
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── DataCard.tsx
│   │   ├── StatusCard.tsx
│   │   ├── Layout.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── AgentSuggestion.tsx
│   │   ├── AgentProcessingOverlay.tsx
│   │   └── index.ts                    # Zentrale Exports
│   ├── pages/
│   │   ├── TrustAwareDashboard.tsx     # Haupt-Dashboard
│   │   └── Dashboard.tsx               # Legacy-Dashboard
│   ├── features/
│   │   ├── crm/                        # CRM-Modul
│   │   ├── fibu/                       # Finanz-Modul
│   │   ├── lager/                      # Lager-Modul
│   │   └── bi/                         # BI-Modul
│   ├── lib/
│   │   └── utils.ts                    # Utility-Funktionen
│   ├── App.tsx                         # Haupt-App-Komponente
│   ├── main.tsx                        # App-Entry-Point
│   ├── index.css                       # Globale Styles
│   └── App.css                         # App-spezifische Styles
├── public/
│   └── vite.svg
├── package.json                        # Dependencies
├── tailwind.config.js                  # Tailwind-Konfiguration
├── vite.config.ts                      # Vite-Konfiguration
└── tsconfig.json                       # TypeScript-Konfiguration
```

### 🔧 Technische Spezifikationen

#### Frontend-Stack
- **Framework**: React 18.2.0
- **Language**: TypeScript 5.0.0
- **Build Tool**: Vite 7.0.5
- **Styling**: Tailwind CSS 3.3.0
- **State Management**: React Hooks + Context
- **HTTP Client**: Fetch API
- **Icons**: Font Awesome 6.4.0

#### Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "zod": "^3.22.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### 🎨 Design-System

#### Farbpalette
```css
/* Trust-Level Farben */
--trust-fact: #10B981;      /* Grün */
--trust-assumption: #F59E0B; /* Gelb */
--trust-uncertain: #F97316;  /* Orange */
--trust-error: #EF4444;      /* Rot */
--trust-processing: #3B82F6; /* Blau */

/* Primärfarben */
--primary-50: #EFF6FF;
--primary-500: #3B82F6;
--primary-900: #1E3A8A;

/* Agent-Farben */
--agent-50: #F0FDF4;
--agent-500: #22C55E;
--agent-900: #14532D;
```

#### Typografie
```css
/* Schriftarten */
font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif;

/* Schriftgrößen */
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */
text-2xl: 1.5rem;    /* 24px */
text-3xl: 1.875rem;  /* 30px */
```

### 🔒 Trust-System-Architektur

#### TrustLevel Enum
```typescript
export type TrustLevel = 'fact' | 'assumption' | 'uncertain' | 'error' | 'processing';
```

#### TrustIndicator Interface
```typescript
interface TrustIndicatorProps {
  level: TrustLevel;
  confidence?: number; // 0-100
  source?: string;
  lastValidated?: Date;
  requiresUserDecision?: boolean;
  className?: string;
  showDetails?: boolean;
  onUserDecision?: (accepted: boolean) => void;
}
```

#### Trust-Konfiguration
```typescript
const trustConfig = {
  fact: {
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: '✅',
    label: 'Fakten-basiert',
    description: 'Validierte Daten'
  },
  // ... weitere Trust-Level
};
```

### 📊 Datenmodelle

#### Module Interface
```typescript
export interface ModuleItem {
  id: Module;
  name: string;
  icon: string;
  description: string;
  trustLevel?: TrustLevel;
  confidence?: number;
  badge?: string;
  disabled?: boolean;
}
```

#### Notification Interface
```typescript
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  trustLevel: TrustLevel;
  confidence?: number;
  source?: string;
  actionUrl?: string;
  category: 'system' | 'business' | 'ai' | 'user';
}
```

#### User Interface
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastLogin: Date;
  trustLevel: TrustLevel;
  confidence?: number;
  permissions: string[];
}
```

### 🔄 State-Management

#### Komponenten-State
```typescript
// TrustIndicator State
const [showDetails, setShowDetails] = useState(false);

// Sidebar State
const [collapsed, setCollapsed] = useState(false);
const [hoveredModule, setHoveredModule] = useState<Module | null>(null);

// Notification State
const [isOpen, setIsOpen] = useState(false);
const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'ai'>('all');

// Chat State
const [activeTab, setActiveTab] = useState<'chat' | 'transcript'>('chat');
const [isRecording, setIsRecording] = useState(false);
```

#### Global State (vorbereitet)
```typescript
// Trust Context
interface TrustContextType {
  globalTrustLevel: TrustLevel;
  setGlobalTrustLevel: (level: TrustLevel) => void;
  userPreferences: TrustPreferences;
  updatePreferences: (prefs: Partial<TrustPreferences>) => void;
}

// Notification Context
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
}
```

### 🌐 API-Integration (vorbereitet)

#### Trust-API Endpoints
```typescript
// Trust-Validierung
POST /api/trust/validate
{
  data: any;
  source: string;
  context: string;
}

// Audit-Log
POST /api/audit/log
{
  action: string;
  userId: string;
  module: string;
  trustLevel: TrustLevel;
  confidence: number;
  timestamp: Date;
}

// Benutzer-Entscheidungen
POST /api/trust/user-decision
{
  messageId: string;
  userId: string;
  accepted: boolean;
  reason?: string;
}
```

#### WebSocket-Integration (vorbereitet)
```typescript
// Real-time Trust-Updates
interface TrustUpdate {
  type: 'trust_update';
  moduleId: string;
  trustLevel: TrustLevel;
  confidence: number;
  timestamp: Date;
}

// Real-time Notifications
interface NotificationUpdate {
  type: 'notification';
  notification: Notification;
}
```

### 📱 Responsive Design

#### Breakpoints
```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

#### Mobile-First Ansatz
```typescript
// Responsive Sidebar
const Sidebar = ({ collapsed = false }) => (
  <div className={cn(
    'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
    collapsed ? 'w-16' : 'w-64',
    'lg:relative lg:translate-x-0', // Desktop: immer sichtbar
    'fixed inset-y-0 left-0 z-50',  // Mobile: overlay
    !isOpen && 'lg:hidden -translate-x-full' // Mobile: versteckt
  )}>
    {/* Sidebar Content */}
  </div>
);
```

### ⚡ Performance-Optimierung

#### Code-Splitting
```typescript
// Lazy Loading für Module
const CrmDashboard = lazy(() => import('./features/crm/CrmDashboard'));
const FibuDashboard = lazy(() => import('./features/fibu/FibuDashboard'));
const LagerDashboard = lazy(() => import('./features/lager/LagerDashboard'));

// Suspense Boundary
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/crm" element={<CrmDashboard />} />
</Suspense>
```

#### Memoization
```typescript
// React.memo für teure Komponenten
export const ModuleCard = React.memo<ModuleCardProps>(({ module, ...props }) => {
  // Komponenten-Logik
});

// useMemo für Berechnungen
const filteredModules = useMemo(() => 
  modules.filter(m => m.trustLevel === 'fact'), 
  [modules]
);
```

#### Virtualisierung (vorbereitet)
```typescript
// Für lange Listen
import { FixedSizeList as List } from 'react-window';

const VirtualizedNotificationList = ({ notifications }) => (
  <List
    height={400}
    itemCount={notifications.length}
    itemSize={80}
    itemData={notifications}
  >
    {NotificationRow}
  </List>
);
```

### 🔧 Build-Konfiguration

#### Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['tailwindcss', 'clsx'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
});
```

#### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          900: '#1E3A8A'
        },
        agent: {
          50: '#F0FDF4',
          500: '#22C55E',
          900: '#14532D'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
};
```

### 🧪 Testing-Strategie

#### Unit Tests (vorbereitet)
```typescript
// TrustIndicator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TrustIndicator } from './TrustIndicator';

describe('TrustIndicator', () => {
  it('renders correct trust level', () => {
    render(<TrustIndicator level="fact" confidence={95} />);
    expect(screen.getByText('Fakten-basiert')).toBeInTheDocument();
  });

  it('shows user decision buttons when required', () => {
    render(
      <TrustIndicator 
        level="assumption" 
        requiresUserDecision={true}
        onUserDecision={jest.fn()}
      />
    );
    expect(screen.getByText('Akzeptieren')).toBeInTheDocument();
    expect(screen.getByText('Ablehnen')).toBeInTheDocument();
  });
});
```

#### Integration Tests (vorbereitet)
```typescript
// Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { TrustAwareDashboard } from './TrustAwareDashboard';

describe('TrustAwareDashboard', () => {
  it('renders all modules with trust indicators', () => {
    render(<TrustAwareDashboard />);
    expect(screen.getByText('Kundenverwaltung')).toBeInTheDocument();
    expect(screen.getByText('Finanzbuchhaltung')).toBeInTheDocument();
    expect(screen.getAllByText(/Fakten-basiert/)).toHaveLength(6);
  });
});
```

### 📈 Monitoring und Analytics

#### Performance-Metriken (vorbereitet)
```typescript
// Trust-Metriken
interface TrustMetrics {
  averageConfidence: number;
  factPercentage: number;
  assumptionPercentage: number;
  userDecisions: {
    accepted: number;
    rejected: number;
  };
  responseTime: number;
}

// Performance-Monitoring
const trackTrustMetric = (metric: TrustMetrics) => {
  // Analytics-Integration
  analytics.track('trust_metric', metric);
};
```

### 🚀 Deployment

#### Production Build
```bash
# Build-Prozess
npm run build

# Output-Verzeichnis
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── favicon.ico
```

#### Docker-Integration (vorbereitet)
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### ✅ Implementierungsstatus

**Frontend-Stack:** ✅ Vollständig implementiert  
**Trust-System:** ✅ Vollständig implementiert  
**Responsive Design:** ✅ Vollständig implementiert  
**Performance:** ✅ Optimiert  
**Testing:** 🔄 Vorbereitet  
**Deployment:** 🔄 Vorbereitet  
**Backend-Integration:** 🔄 Vorbereitet  

Die technische Architektur ist vollständig implementiert und bereit für die Integration mit Backend-Services und KI-Agenten. 