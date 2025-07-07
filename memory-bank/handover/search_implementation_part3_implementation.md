# VALEO-NeuroERP: Erweiterte Suchfunktionalität - Teil 3: Implementierung & Testing

## 🚀 Implementierungsplan

### Sprint-Planung

```yaml
sprint_plan:
  sprint_1:
    name: "Grundlagen & Setup"
    duration: "2 weeks"
    goals:
      - "Entwicklungsumgebung einrichten"
      - "Basis-API implementieren"
      - "MongoDB Atlas Integration"
    tasks:
      - task: "Setup Entwicklungsumgebung"
        effort: "2 days"
        owner: "DevOps"
        dependencies: []
      - task: "MongoDB Atlas Konfiguration"
        effort: "2 days"
        owner: "Backend"
        dependencies: ["Setup Entwicklungsumgebung"]
      - task: "Basis-API-Endpoints"
        effort: "5 days"
        owner: "Backend"
        dependencies: ["MongoDB Atlas Konfiguration"]
      - task: "Initial Testing"
        effort: "3 days"
        owner: "QA"
        dependencies: ["Basis-API-Endpoints"]

  sprint_2:
    name: "FAISS & Hybrid Search"
    duration: "2 weeks"
    goals:
      - "FAISS Integration"
      - "Vector Search Implementation"
      - "Hybrid Search Orchestrator"
    tasks:
      - task: "FAISS Setup & Konfiguration"
        effort: "3 days"
        owner: "Backend"
        dependencies: []
      - task: "Vector Search Implementation"
        effort: "5 days"
        owner: "Backend"
        dependencies: ["FAISS Setup & Konfiguration"]
      - task: "Hybrid Search Orchestrator"
        effort: "4 days"
        owner: "Backend"
        dependencies: ["Vector Search Implementation"]

  sprint_3:
    name: "Frontend & UI"
    duration: "2 weeks"
    goals:
      - "Such-Interface implementieren"
      - "Ergebnis-Darstellung"
      - "Filter & Facetten"
    tasks:
      - task: "Such-Interface Entwicklung"
        effort: "5 days"
        owner: "Frontend"
        dependencies: []
      - task: "Ergebnis-Komponenten"
        effort: "4 days"
        owner: "Frontend"
        dependencies: ["Such-Interface Entwicklung"]
      - task: "Filter-System"
        effort: "3 days"
        owner: "Frontend"
        dependencies: ["Ergebnis-Komponenten"]

  sprint_4:
    name: "Monitoring & Performance"
    duration: "2 weeks"
    goals:
      - "ELK-Stack Integration"
      - "Performance-Monitoring"
      - "Caching-System"
    tasks:
      - task: "ELK-Stack Setup"
        effort: "3 days"
        owner: "DevOps"
        dependencies: []
      - task: "Monitoring Implementation"
        effort: "4 days"
        owner: "Backend"
        dependencies: ["ELK-Stack Setup"]
      - task: "Cache-System"
        effort: "5 days"
        owner: "Backend"
        dependencies: ["Monitoring Implementation"]

  sprint_5:
    name: "Sicherheit & Testing"
    duration: "2 weeks"
    goals:
      - "Security Implementation"
      - "Performance Testing"
      - "Load Testing"
    tasks:
      - task: "Security Features"
        effort: "5 days"
        owner: "Security"
        dependencies: []
      - task: "Performance Tests"
        effort: "4 days"
        owner: "QA"
        dependencies: ["Security Features"]
      - task: "Load Testing"
        effort: "3 days"
        owner: "QA"
        dependencies: ["Performance Tests"]

  sprint_6:
    name: "Finalisierung"
    duration: "2 weeks"
    goals:
      - "Dokumentation"
      - "UI/UX Polishing"
      - "Go-Live Vorbereitung"
    tasks:
      - task: "Dokumentation"
        effort: "4 days"
        owner: "Tech Writer"
        dependencies: []
      - task: "UI/UX Optimierung"
        effort: "5 days"
        owner: "Frontend"
        dependencies: []
      - task: "Go-Live Prep"
        effort: "3 days"
        owner: "DevOps"
        dependencies: ["Dokumentation", "UI/UX Optimierung"]
```

## 🧪 Test-Strategie

### Unit Tests

```python
class SearchServiceTests(unittest.TestCase):
    def setUp(self):
        self.search_service = SearchService()
        self.test_data = self.load_test_data()

    def test_basic_search(self):
        query = "test query"
        results = self.search_service.search(query)
        self.assertIsNotNone(results)
        self.assertTrue(len(results) > 0)

    def test_vector_search(self):
        query_vector = np.random.rand(384)  # BERT embedding dimension
        results = self.search_service.vector_search(query_vector)
        self.assertIsNotNone(results)
        self.assertEqual(len(results), 10)  # top-k = 10

    def test_hybrid_search(self):
        query = "test query"
        results = self.search_service.hybrid_search(query)
        self.assertIsNotNone(results)
        self.assertTrue(len(results) > 0)
        self.assertTrue(all('score' in r for r in results))

    def test_search_with_filters(self):
        query = "test query"
        filters = {
            "date_range": {"start": "2024-01-01", "end": "2024-12-31"},
            "categories": ["docs", "articles"]
        }
        results = self.search_service.search(query, filters=filters)
        self.assertTrue(all(r['category'] in filters['categories'] for r in results))

    def test_cache_behavior(self):
        query = "frequently searched query"
        # First search should cache
        results1 = self.search_service.search(query)
        # Second search should hit cache
        with self.assertLogs('search_service', level='DEBUG') as log:
            results2 = self.search_service.search(query)
            self.assertTrue(any('cache hit' in msg for msg in log.output))
        self.assertEqual(results1, results2)
```

### Integration Tests

```python
class SearchIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.api_client = TestClient(app)
        cls.test_data = load_test_dataset()
        cls.index_test_data()

    def test_search_endpoint(self):
        response = self.api_client.post(
            "/api/v1/search",
            json={"query": "test query", "page": 1, "per_page": 10}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('results', data)
        self.assertIn('total', data)
        self.assertIn('page', data)

    def test_suggest_endpoint(self):
        response = self.api_client.get(
            "/api/v1/suggest",
            params={"q": "te", "limit": 5}
        )
        self.assertEqual(response.status_code, 200)
        suggestions = response.json()
        self.assertTrue(len(suggestions) <= 5)
        self.assertTrue(all(s.startswith('te') for s in suggestions))

    def test_document_crud(self):
        # Create
        doc = {"title": "Test Doc", "content": "Test Content"}
        response = self.api_client.post("/api/v1/document", json=doc)
        self.assertEqual(response.status_code, 201)
        doc_id = response.json()['id']

        # Read
        response = self.api_client.get(f"/api/v1/document/{doc_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['title'], "Test Doc")

        # Update
        update = {"title": "Updated Doc"}
        response = self.api_client.put(
            f"/api/v1/document/{doc_id}",
            json=update
        )
        self.assertEqual(response.status_code, 200)

        # Delete
        response = self.api_client.delete(f"/api/v1/document/{doc_id}")
        self.assertEqual(response.status_code, 204)
```

### Performance Tests

```python
class SearchPerformanceTests(unittest.TestCase):
    def setUp(self):
        self.locust_client = LocustClient()
        self.test_queries = load_test_queries()

    @task(1)
    def test_search_latency(self):
        query = random.choice(self.test_queries)
        with self.timer('search_latency'):
            response = self.client.post(
                "/api/v1/search",
                json={"query": query}
            )
        self.assertLess(self.timer.duration, 0.2)  # 200ms max

    @task(2)
    def test_suggest_latency(self):
        prefix = random.choice(self.test_queries)[:3]
        with self.timer('suggest_latency'):
            response = self.client.get(
                "/api/v1/suggest",
                params={"q": prefix}
            )
        self.assertLess(self.timer.duration, 0.05)  # 50ms max

    @task(3)
    def test_concurrent_searches(self):
        concurrent_users = 100
        search_duration = 60  # seconds
        results = self.run_concurrent_test(
            method=self.client.post,
            endpoint="/api/v1/search",
            users=concurrent_users,
            duration=search_duration
        )
        self.assertGreater(results.rps, 50)  # 50 requests per second
        self.assertLess(results.avg_response_time, 0.2)
        self.assertLess(results.error_rate, 0.01)  # 1% max error rate
```

### Load Tests

```python
class SearchLoadTest(HttpUser):
    wait_time = between(1, 2)

    @task(10)
    def search(self):
        query = generate_random_query()
        self.client.post("/api/v1/search", json={
            "query": query,
            "page": 1,
            "per_page": 20
        })

    @task(5)
    def suggest(self):
        prefix = generate_random_prefix()
        self.client.get(f"/api/v1/suggest?q={prefix}")

    @task(2)
    def get_document(self):
        doc_id = random.choice(self.test_doc_ids)
        self.client.get(f"/api/v1/document/{doc_id}")

    def on_start(self):
        self.test_doc_ids = load_test_document_ids()
```

## 📝 Code-Standards

### TypeScript Standards

```typescript
// Interfaces
interface SearchRequest {
  query: string;
  filters?: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    categories?: string[];
    tags?: string[];
  };
  pagination: {
    page: number;
    perPage: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// Type Guards
function isValidSearchRequest(obj: any): obj is SearchRequest {
  return (
    typeof obj === 'object' &&
    typeof obj.query === 'string' &&
    (!obj.filters || typeof obj.filters === 'object') &&
    typeof obj.pagination === 'object' &&
    typeof obj.pagination.page === 'number' &&
    typeof obj.pagination.perPage === 'number'
  );
}

// Utility Types
type SearchResponse<T> = {
  results: T[];
  total: number;
  page: number;
  pages: number;
  took: number;
};

// Constants
const SEARCH_CONSTANTS = {
  MAX_RESULTS_PER_PAGE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_QUERY_LENGTH: 1000,
  MIN_QUERY_LENGTH: 2,
} as const;
```

### Python Standards

```python
from typing import TypeVar, Generic, List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar('T')

class SearchResult(BaseModel, Generic[T]):
    """
    Generic search result container
    """
    item: T
    score: float = Field(..., ge=0, le=1)
    highlights: Dict[str, List[str]] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SearchResponse(BaseModel, Generic[T]):
    """
    Generic search response container
    """
    results: List[SearchResult[T]]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    pages: int = Field(..., ge=0)
    took: float = Field(..., ge=0)  # time in milliseconds
    facets: Optional[Dict[str, Dict[str, int]]] = None

class SearchService:
    """
    Core search service implementation
    """
    def __init__(self):
        self.atlas_client = AtlasSearchClient()
        self.faiss_client = FAISSClient()
        self.cache = SearchCache()
        self.logger = SearchLogger()

    async def search(
        self,
        query: str,
        filters: Optional[Dict] = None,
        page: int = 1,
        per_page: int = 20
    ) -> SearchResponse[T]:
        """
        Perform hybrid search
        """
        try:
            # Check cache
            cache_key = self._generate_cache_key(query, filters, page, per_page)
            cached_result = await self.cache.get(cache_key)
            if cached_result:
                self.logger.info("Cache hit for query", query=query)
                return cached_result

            # Parallel search execution
            text_results, vector_results = await asyncio.gather(
                self.atlas_client.search(query, filters),
                self.faiss_client.search(query)
            )

            # Merge results
            merged_results = self._merge_results(
                text_results,
                vector_results,
                weights={'text': 0.7, 'vector': 0.3}
            )

            # Paginate
            paginated = self._paginate(merged_results, page, per_page)

            # Create response
            response = SearchResponse(
                results=paginated,
                total=len(merged_results),
                page=page,
                pages=math.ceil(len(merged_results) / per_page),
                took=time.time() - start_time
            )

            # Cache result
            await self.cache.set(cache_key, response)

            return response

        except Exception as e:
            self.logger.error("Search failed", error=str(e), query=query)
            raise SearchException(f"Search failed: {str(e)}")

    def _merge_results(
        self,
        text_results: List[SearchResult],
        vector_results: List[SearchResult],
        weights: Dict[str, float]
    ) -> List[SearchResult]:
        """
        Merge and normalize results from different search methods
        """
        # Implementation details...
        pass

    def _paginate(
        self,
        results: List[SearchResult],
        page: int,
        per_page: int
    ) -> List[SearchResult]:
        """
        Paginate results
        """
        start = (page - 1) * per_page
        end = start + per_page
        return results[start:end]
```

## 🔍 Code Review Checkliste

```markdown
### Allgemein
- [ ] Code folgt den Projektstandards
- [ ] Ausreichende Dokumentation
- [ ] Fehlerbehandlung implementiert
- [ ] Logging vorhanden
- [ ] Performance-Aspekte berücksichtigt

### Sicherheit
- [ ] Input-Validierung
- [ ] SQL/NoSQL-Injection Prevention
- [ ] XSS-Prevention
- [ ] CSRF-Protection
- [ ] Rate-Limiting

### Testing
- [ ] Unit Tests vorhanden
- [ ] Integration Tests vorhanden
- [ ] Edge Cases getestet
- [ ] Performance Tests
- [ ] Security Tests

### Performance
- [ ] Caching implementiert
- [ ] Query-Optimierung
- [ ] Async/Await korrekt verwendet
- [ ] Ressourcen-Effizienz
- [ ] Memory Leaks ausgeschlossen
``` 