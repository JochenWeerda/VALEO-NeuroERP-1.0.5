import pytest
import asyncio
from datetime import datetime
from uuid import uuid4
import time

# Enums für die Transaktionsklasse
class TransactionType:
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    TRANSFER = "transfer"

class TransactionStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Einfache Implementierung der Transaktionsklasse für Tests
class Transaction:
    def __init__(self, 
                 id: str,
                 type: str,
                 amount: float,
                 source_account: str,
                 target_account: str,
                 status: str = TransactionStatus.PENDING,
                 created_at: datetime = None,
                 updated_at: datetime = None,
                 version: int = 1,
                 metadata: dict = None):
        self.id = id
        self.type = type
        self.amount = amount
        self.source_account = source_account
        self.target_account = target_account
        self.status = status
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.version = version
        self.metadata = metadata or {}
    
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "amount": self.amount,
            "source_account": self.source_account,
            "target_account": self.target_account,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "version": self.version,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data["id"],
            type=data["type"],
            amount=data["amount"],
            source_account=data["source_account"],
            target_account=data["target_account"],
            status=data["status"],
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            version=data.get("version", 1),
            metadata=data.get("metadata", {})
        )
    
    def update_status(self, status):
        self.status = status
        self.updated_at = datetime.now()
        self.version += 1

# Einfache Implementierung des ChunkManagers für Tests
class ChunkManager:
    def __init__(self, chunk_size=5):
        self.chunk_size = chunk_size
    
    def split_into_chunks(self, transactions):
        return [transactions[i:i + self.chunk_size] for i in range(0, len(transactions), self.chunk_size)]
    
    async def process_chunks(self, chunks, processor_func):
        results = []
        for i, chunk in enumerate(chunks):
            result = await processor_func(chunk)
            results.append(result)
        return results

# Einfache Implementierung des AsyncAuditLoggers für Tests
class AsyncAuditLogger:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.running = False
        self.worker_task = None
        self.logs = []
    
    async def start(self):
        self.running = True
        self.worker_task = asyncio.create_task(self._worker())
    
    async def stop(self):
        self.running = False
        if self.worker_task:
            await self.worker_task
    
    async def log(self, transaction, action):
        await self.queue.put({
            "timestamp": datetime.now(),
            "transaction_id": transaction.id,
            "action": action,
            "details": transaction.to_dict()
        })
    
    async def _worker(self):
        while self.running or not self.queue.empty():
            try:
                log_entry = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                self.logs.append(log_entry)
                self.queue.task_done()
            except asyncio.TimeoutError:
                pass
    
    async def get_logs(self):
        return self.logs

# Tests für die Transaktionsklasse
@pytest.fixture
def sample_transaction():
    """Erstellt eine Beispieltransaktion für Tests."""
    return Transaction(
        id=str(uuid4()),
        type=TransactionType.TRANSFER,
        amount=100.0,
        source_account="ACC123",
        target_account="ACC456",
        status=TransactionStatus.PENDING,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        version=1
    )

@pytest.fixture
def chunk_manager():
    """Erstellt einen ChunkManager für Tests."""
    return ChunkManager(chunk_size=5)

@pytest.fixture
def audit_logger():
    """Erstellt einen AsyncAuditLogger für Tests."""
    return AsyncAuditLogger()

def test_transaction_creation(sample_transaction):
    """Testet die Erstellung einer Transaktion."""
    assert sample_transaction.id is not None
    assert sample_transaction.type == TransactionType.TRANSFER
    assert sample_transaction.amount == 100.0
    assert sample_transaction.status == TransactionStatus.PENDING
    assert sample_transaction.version == 1

def test_transaction_serialization(sample_transaction):
    """Testet die Serialisierung einer Transaktion."""
    serialized = sample_transaction.to_dict()
    assert serialized["id"] == sample_transaction.id
    assert serialized["type"] == sample_transaction.type
    assert serialized["amount"] == sample_transaction.amount
    assert serialized["status"] == sample_transaction.status

def test_transaction_update_status(sample_transaction):
    """Testet die Aktualisierung des Status einer Transaktion."""
    original_version = sample_transaction.version
    original_updated_at = sample_transaction.updated_at
    
    # Kurz warten, damit die Zeitstempel unterschiedlich sind
    time.sleep(0.01)
    
    # Status aktualisieren
    sample_transaction.update_status(TransactionStatus.PROCESSING)
    
    # Überprüfen, ob der Status aktualisiert wurde
    assert sample_transaction.status == TransactionStatus.PROCESSING
    assert sample_transaction.version == original_version + 1
    assert sample_transaction.updated_at > original_updated_at

@pytest.mark.asyncio
async def test_chunk_processing(chunk_manager, sample_transaction):
    """Testet die Chunk-basierte Verarbeitung von Transaktionen."""
    # Erstelle 12 Transaktionen
    transactions = [sample_transaction]
    for i in range(11):
        tx = Transaction(
            id=str(uuid4()),
            type=TransactionType.TRANSFER,
            amount=100.0 + i,
            source_account=f"SRC{i}",
            target_account=f"TGT{i}",
            status=TransactionStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            version=1
        )
        transactions.append(tx)
    
    # Verarbeite in Chunks
    chunks = chunk_manager.split_into_chunks(transactions)
    assert len(chunks) == 3  # 12 Transaktionen / 5 pro Chunk = 3 Chunks
    assert len(chunks[0]) == 5
    assert len(chunks[1]) == 5
    assert len(chunks[2]) == 2
    
    # Simuliere die Verarbeitung
    async def process_chunk(chunk):
        return {"processed": len(chunk)}
    
    results = await chunk_manager.process_chunks(chunks, process_chunk)
    assert len(results) == 3
    assert results[0]["processed"] == 5
    assert results[1]["processed"] == 5
    assert results[2]["processed"] == 2

@pytest.mark.asyncio
async def test_audit_logging(audit_logger, sample_transaction):
    """Testet das asynchrone Audit-Logging."""
    # Starte den Logger
    await audit_logger.start()
    
    # Protokolliere eine Transaktion
    await audit_logger.log(sample_transaction, "CREATED")
    
    # Warte kurz, damit der asynchrone Logger Zeit hat
    await asyncio.sleep(0.1)
    
    # Prüfe, ob die Transaktion protokolliert wurde
    logs = await audit_logger.get_logs()
    assert len(logs) >= 1
    assert any(log["transaction_id"] == sample_transaction.id for log in logs)
    
    # Stoppe den Logger
    await audit_logger.stop()

if __name__ == "__main__":
    pytest.main(["-v", __file__]) 