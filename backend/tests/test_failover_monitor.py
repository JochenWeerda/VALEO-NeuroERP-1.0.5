"""
Tests für den Failover-Monitor
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
import psycopg2
from backend.services.failover_monitor import (
    FailoverMonitor,
    DatabaseNode,
    FailoverEvent
)

# Test Configuration
TEST_CONFIG = {
    "redis_host": "localhost",
    "redis_port": 6379,
    "database": "test_db",
    "user": "test_user",
    "password": "test_pass"
}

@pytest.fixture
def monitor():
    """Fixture für den Failover-Monitor"""
    return FailoverMonitor(TEST_CONFIG)

@pytest.fixture
def sample_nodes():
    """Fixture für Test-Nodes"""
    return {
        "node1": DatabaseNode(
            host="db1.example.com",
            port=5432,
            role="primary",
            status="healthy",
            last_seen=datetime.now(),
            replication_lag=0.0
        ),
        "node2": DatabaseNode(
            host="db2.example.com",
            port=5432,
            role="replica",
            status="healthy",
            last_seen=datetime.now(),
            replication_lag=0.5
        ),
        "node3": DatabaseNode(
            host="db3.example.com",
            port=5432,
            role="replica",
            status="healthy",
            last_seen=datetime.now(),
            replication_lag=1.0
        )
    }

class TestFailoverMonitor:
    """Testfälle für den Failover-Monitor"""
    
    @pytest.mark.asyncio
    async def test_check_nodes(self, monitor, sample_nodes):
        """Test: Node-Status-Prüfung"""
        monitor.nodes = sample_nodes.copy()
        
        with patch("psycopg2.connect") as mock_connect:
            mock_cur = Mock()
            mock_cur.fetchone.side_effect = [(True,), (0.5,)]  # is_replica, lag
            mock_connect.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = mock_cur
            
            await monitor.check_nodes()
            
            assert monitor.nodes["node1"].status == "healthy"
            assert mock_cur.execute.call_count >= 1
            
    @pytest.mark.asyncio
    async def test_initiate_failover(self, monitor, sample_nodes):
        """Test: Failover-Initiierung"""
        monitor.nodes = sample_nodes.copy()
        failed_node = monitor.nodes["node1"]
        
        with patch.object(monitor, "select_new_primary") as mock_select, \
             patch.object(monitor, "promote_replica") as mock_promote, \
             patch.object(monitor, "update_connection_routing") as mock_route, \
             patch.object(monitor, "store_failover_event") as mock_store:
            
            mock_select.return_value = monitor.nodes["node2"]
            mock_promote.return_value = None
            mock_route.return_value = None
            mock_store.return_value = None
            
            await monitor.initiate_failover(failed_node)
            
            assert mock_select.called
            assert mock_promote.called
            assert mock_route.called
            assert mock_store.called
            
    @pytest.mark.asyncio
    async def test_select_new_primary(self, monitor, sample_nodes):
        """Test: Auswahl des neuen Primary-Nodes"""
        monitor.nodes = sample_nodes.copy()
        
        new_primary = await monitor.select_new_primary()
        
        assert new_primary is not None
        assert new_primary.host == "db2.example.com"  # Node mit geringster Verzögerung
        
    @pytest.mark.asyncio
    async def test_promote_replica(self, monitor, sample_nodes):
        """Test: Promotion eines Replica-Nodes"""
        node = sample_nodes["node2"]
        
        with patch("psycopg2.connect") as mock_connect:
            mock_cur = Mock()
            mock_connect.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = mock_cur
            
            with patch.object(monitor, "is_node_primary", return_value=True):
                await monitor.promote_replica(node)
                
                assert mock_cur.execute.called
                
    @pytest.mark.asyncio
    async def test_is_node_primary(self, monitor, sample_nodes):
        """Test: Prüfung ob Node Primary ist"""
        node = sample_nodes["node1"]
        
        with patch("psycopg2.connect") as mock_connect:
            mock_cur = Mock()
            mock_cur.fetchone.return_value = (False,)
            mock_connect.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = mock_cur
            
            result = await monitor.is_node_primary(node)
            
            assert result is True
            assert mock_cur.execute.called
            
    @pytest.mark.asyncio
    async def test_update_metrics(self, monitor, sample_nodes):
        """Test: Metrik-Aktualisierung"""
        monitor.nodes = sample_nodes.copy()
        
        with patch("prometheus_client.Gauge.labels") as mock_labels:
            mock_metric = Mock()
            mock_labels.return_value = mock_metric
            
            await monitor.update_metrics()
            
            assert mock_labels.call_count == 2  # Zwei Replica-Nodes
            assert mock_metric.set.call_count == 2
            
    @pytest.mark.asyncio
    async def test_store_failover_event(self, monitor):
        """Test: Speicherung eines Failover-Events"""
        event = FailoverEvent(
            id="test_failover",
            old_primary="db1.example.com",
            new_primary="db2.example.com",
            duration=1.5,
            success=True
        )
        
        with patch.object(monitor.redis, "set") as mock_set:
            await monitor.store_failover_event(event)
            
            assert mock_set.called
            assert mock_set.call_args[0][0] == "failover_event:test_failover"
            
    @pytest.mark.asyncio
    async def test_failover_performance(self, monitor, sample_nodes):
        """Test: Failover-Performance"""
        monitor.nodes = sample_nodes.copy()
        failed_node = monitor.nodes["node1"]
        
        with patch.object(monitor, "select_new_primary") as mock_select, \
             patch.object(monitor, "promote_replica") as mock_promote, \
             patch.object(monitor, "update_connection_routing") as mock_route, \
             patch.object(monitor, "store_failover_event") as mock_store:
            
            mock_select.return_value = monitor.nodes["node2"]
            
            start_time = datetime.now()
            await monitor.initiate_failover(failed_node)
            duration = (datetime.now() - start_time).total_seconds()
            
            assert duration < 2.0  # Failover sollte unter 2 Sekunden dauern
            
    @pytest.mark.asyncio
    async def test_failover_error_handling(self, monitor, sample_nodes):
        """Test: Fehlerbehandlung beim Failover"""
        monitor.nodes = sample_nodes.copy()
        failed_node = monitor.nodes["node1"]
        
        with patch.object(monitor, "select_new_primary", side_effect=Exception("Test Error")), \
             patch.object(monitor, "store_failover_event") as mock_store:
            
            await monitor.initiate_failover(failed_node)
            
            assert mock_store.called
            event_arg = mock_store.call_args[0][0]
            assert event_arg.success is False
            assert "Test Error" in event_arg.error 