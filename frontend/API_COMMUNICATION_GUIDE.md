# VALEO NeuroERP - API-Kommunikation Guide

## 🌐 Übersicht

Das VALEO NeuroERP System verwendet eine moderne, skalierbare API-Architektur mit drei Hauptkomponenten:

- **Frontend** (React/TypeScript) - Port 3000
- **Middleware** (FastAPI Gateway) - Port 8001  
- **Backend** (FastAPI Services) - Port 8000

## 🏗️ Architektur

```
┌─────────────┐    HTTP/HTTPS    ┌──────────────┐    HTTP/HTTPS    ┌─────────────┐
│   Frontend  │ ───────────────► │  Middleware  │ ───────────────► │   Backend   │
│  (React)    │                  │  (Gateway)   │                  │  (FastAPI)  │
│  Port 3000  │                  │  Port 8001   │                  │  Port 8000  │
└─────────────┘                  └──────────────┘                  └─────────────┘
       │                                │                                │
       │                                │                                │
       ▼                                ▼                                ▼
┌─────────────┐                  ┌──────────────┐                  ┌─────────────┐
│   Browser   │                  │     Redis    │                  │  Database   │
│   Storage   │                  │   (Cache)    │                  │  (SQLite)   │
└─────────────┘                  └──────────────┘                  └─────────────┘
```

## 🔧 Komponenten

### **Frontend (React/TypeScript)**
- **Port**: 3000
- **Technologie**: React 18, TypeScript, Material-UI
- **Verantwortlich**: UI/UX, Benutzerinteraktionen, State Management

### **Middleware (API Gateway)**
- **Port**: 8001
- **Technologie**: FastAPI, Redis, Prometheus
- **Verantwortlich**: 
  - Request Routing
  - Authentication/Authorization
  - Rate Limiting
  - Caching
  - Monitoring
  - Load Balancing

### **Backend (Services)**
- **Port**: 8000
- **Technologie**: FastAPI, SQLAlchemy, Celery
- **Verantwortlich**:
  - Business Logic
  - Datenbankoperationen
  - File Processing
  - Background Tasks

## 🚀 Installation & Setup

### **1. Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### **2. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### **3. Middleware Setup**
```bash
cd backend
python start_middleware.py
```

### **4. Redis Setup (Optional)**
```bash
# Windows (mit WSL oder Docker)
docker run -d -p 6379:6379 redis:alpine

# Linux/macOS
sudo apt-get install redis-server
redis-server
```

## 📡 API-Kommunikation

### **Frontend → Middleware**

#### **API Service (ApiService.ts)**
```typescript
import { apiService } from '../services/ApiService';

// Authentifizierung
const loginResponse = await apiService.login({
  username: 'admin',
  password: 'admin'
});

// Daten abrufen
const transactions = await apiService.getTransactions();
const inventory = await apiService.getInventory();

// Daten erstellen
const newTransaction = await apiService.createTransaction({
  type: 'income',
  amount: 1000,
  date: new Date().toISOString(),
  description: 'Test Transaction',
  user_id: 'user123',
  status: 'pending'
});
```

#### **React Context (ApiContext.tsx)**
```typescript
import { useApi } from '../contexts/ApiContext';

const MyComponent = () => {
  const {
    user,
    isAuthenticated,
    transactions,
    createTransaction,
    systemStatus
  } = useApi();

  // Komponente verwendet API-Daten
};
```

### **Middleware → Backend**

#### **API Gateway (api_gateway.py)**
```python
# Request weiterleiten
response = await self.http_client.request(
    method=request.method,
    url=f"{Config.BACKEND_URL}/{path}",
    headers=headers,
    params=params,
    json=body
)

# Caching
await self.cache_data(path, params, response_data)

# Rate Limiting
if not await self.check_rate_limit(token):
    raise HTTPException(status_code=429, detail="Rate limit exceeded")
```

## 🔐 Authentifizierung

### **JWT Token Flow**
1. **Login**: Frontend sendet Credentials an Backend
2. **Token**: Backend validiert und gibt JWT Token zurück
3. **Storage**: Frontend speichert Token im localStorage
4. **Requests**: Alle API-Requests enthalten Authorization Header
5. **Validation**: Middleware validiert Token vor Weiterleitung

```typescript
// Frontend Login
const response = await apiService.login({
  username: 'admin',
  password: 'admin'
});

// Token wird automatisch gespeichert
apiService.setAuthToken(response.data.access_token);

// Automatische Token-Injection in Requests
apiService.getTransactions(); // Token wird automatisch hinzugefügt
```

## 📊 Monitoring & Metriken

### **Prometheus Metriken**
```python
# Request Count
REQUEST_COUNT = Counter('api_gateway_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])

# Request Duration
REQUEST_DURATION = Histogram('api_gateway_request_duration_seconds', 'Request duration in seconds')

# Active Connections
ACTIVE_CONNECTIONS = Gauge('api_gateway_active_connections', 'Number of active connections')
```

### **Health Checks**
```bash
# Backend Health
curl http://localhost:8000/health

# Middleware Health
curl http://localhost:8001/health

# System Status
curl http://localhost:8001/status
```

## 🗄️ Caching

### **Redis Caching**
```python
# Cache GET-Requests für 5 Minuten
CACHE_TTL = 300

# Cache Key Format
cache_key = f"cache:{path}:{hash(params)}"

# Cache Operationen
await self.cache_data(path, params, response_data)
cached_data = await self.get_cached_data(path, params)
```

### **Cache-Invalidierung**
```typescript
// Nach POST/PUT/DELETE Operationen
await createTransaction(data);
// Cache wird automatisch invalidiert
```

## ⚡ Rate Limiting

### **Redis-basiertes Rate Limiting**
```python
# 100 Requests pro Minute pro Token
RATE_LIMIT = 100

# Rate Limiting Key
key = f"rate_limit:{token}"

# Prüfung
if current_count >= RATE_LIMIT:
    raise HTTPException(status_code=429, detail="Rate limit exceeded")
```

## 🔄 Retry-Logik

### **Automatische Retries**
```python
# 3 Versuche mit exponentieller Backoff
MAX_RETRIES = 3
RETRY_DELAY = 1.0

for attempt in range(MAX_RETRIES):
    try:
        response = await self.http_client.request(...)
        return response.json()
    except httpx.TimeoutException:
        if attempt == MAX_RETRIES - 1:
            raise HTTPException(status_code=504, detail="Backend timeout")
        await asyncio.sleep(RETRY_DELAY * (attempt + 1))
```

## 📝 API-Endpunkte

### **Backend Endpoints**
```
POST   /token                    # Login
GET    /users/me                 # Current User
GET    /transactions/            # Get Transactions
POST   /transactions/            # Create Transaction
GET    /inventory/               # Get Inventory
POST   /inventory/               # Create Inventory Item
GET    /documents/               # Get Documents
POST   /documents/upload         # Upload Document
GET    /reports/                 # Get Reports
POST   /reports/                 # Create Report
GET    /notifications/           # Get Notifications
PUT    /notifications/{id}/read  # Mark Notification Read
GET    /health                   # Health Check
```

### **Middleware Endpoints**
```
GET    /                         # Gateway Info
GET    /health                   # Health Check
GET    /status                   # System Status
*      /{path:path}             # Proxy to Backend
```

## 🛠️ Entwicklung

### **Environment Variables**
```bash
# Frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_MIDDLEWARE_URL=http://localhost:8001

# Backend (settings.py)
BACKEND_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=["http://localhost:3000"]
```

### **Debugging**
```typescript
// Frontend Debugging
console.log('API Response:', response);
console.log('System Status:', systemStatus);

// Middleware Logging
logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.3f}s")
```

## 🧪 Testing

### **API Tests**
```bash
# Backend Tests
cd backend
python -m pytest tests/

# Middleware Tests
cd backend/middleware
python -m pytest tests/

# Frontend Tests
cd frontend
npm test
```

### **Integration Tests**
```typescript
// Frontend Integration Test
test('API Communication', async () => {
  const response = await apiService.getSystemStatus();
  expect(response.success).toBe(true);
  expect(response.data.backend).toBe(true);
});
```

## 🚨 Error Handling

### **Frontend Error Handling**
```typescript
try {
  const response = await apiService.getTransactions();
  if (!response.success) {
    throw new Error(response.error);
  }
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

### **Middleware Error Handling**
```python
try:
    response_data = await self.forward_request(path, request, token)
    return response_data
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        raise HTTPException(status_code=401, detail="Unauthorized")
    elif e.response.status_code == 404:
        raise HTTPException(status_code=404, detail="Not found")
    else:
        raise HTTPException(status_code=e.response.status_code, detail=f"Backend error")
```

## 📈 Performance

### **Optimierungen**
- **Caching**: Redis-basiertes Caching für GET-Requests
- **Connection Pooling**: HTTPX mit Connection Pooling
- **Rate Limiting**: Schutz vor API-Missbrauch
- **Retry Logic**: Automatische Wiederholung bei Fehlern
- **Monitoring**: Prometheus Metriken für Performance-Tracking

### **Best Practices**
1. **Caching**: Verwende Cache für häufig abgerufene Daten
2. **Rate Limiting**: Respektiere API-Limits
3. **Error Handling**: Implementiere robuste Fehlerbehandlung
4. **Monitoring**: Überwache API-Performance
5. **Security**: Verwende HTTPS in Produktion

## 🔧 Troubleshooting

### **Häufige Probleme**

#### **CORS Errors**
```bash
# Middleware CORS konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### **Authentication Errors**
```typescript
// Token prüfen
if (!apiService.isAuthenticated()) {
  // Redirect to login
  window.location.href = '/login';
}
```

#### **Connection Timeouts**
```python
# Timeout erhöhen
TIMEOUT = 60.0  # 60 Sekunden
```

## 📚 Weitere Ressourcen

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Redis Documentation](https://redis.io/documentation)
- [Prometheus Documentation](https://prometheus.io/docs/)

---

**Entwickelt für VALEO NeuroERP 2.0**  
*Moderne API-Kommunikation für Enterprise-Anwendungen* 