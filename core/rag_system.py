# -*- coding: utf-8 -*-
"""
💾 GENXAIS RAG System
"Build the Future from the Beginning"

Retrieval-Augmented Generation system for knowledge storage and handovers.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger("GENXAIS.RAG")

class RAGSystem:
    """RAG system for GENXAIS Framework knowledge management."""
    
    def __init__(self, config: Any):
        self.config = config
        self.storage_type = config.get("rag.storage_type", "local_json")
        self.available = True
        self.storage = {
            "van_results": {},
            "plan_results": {},
            "create_results": {},
            "implement_results": {},
            "reflect_results": {},
            "handovers": []
        }
        
        self._initialize_storage()
        
    def _initialize_storage(self):
        """Initialize RAG storage system."""
        
        try:
            if self.storage_type == "local_json":
                self._init_local_storage()
            elif self.storage_type == "mongodb":
                self._init_mongodb_storage()
            else:
                logger.warning(f"⚠️ Unknown storage type: {self.storage_type}, using local fallback")
                self._init_local_storage()
                
            logger.info(f"💾 RAG system initialized with {self.storage_type}")
            
        except Exception as e:
            logger.error(f"❌ RAG initialization failed: {e}")
            self.available = False
            
    def _init_local_storage(self):
        """Initialize local JSON storage."""
        
        os.makedirs("rag_storage", exist_ok=True)
        
        # Load existing data if available
        storage_file = "rag_storage/genxais_knowledge.json"
        if os.path.exists(storage_file):
            try:
                with open(storage_file, 'r', encoding='utf-8') as f:
                    self.storage = json.load(f)
                logger.info("📂 Existing RAG data loaded")
            except Exception as e:
                logger.warning(f"⚠️ Could not load existing RAG data: {e}")
                
    def _init_mongodb_storage(self):
        """Initialize MongoDB storage."""
        
        try:
            # This would normally connect to MongoDB
            # For now, fall back to local storage
            logger.warning("🔄 MongoDB not available, falling back to local storage")
            self._init_local_storage()
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            self._init_local_storage()
            
    async def store_phase_result(self, phase: str, data: Dict[str, Any]) -> bool:
        """Store phase execution result."""
        
        if not self.available:
            logger.warning("⚠️ RAG system not available")
            return False
            
        try:
            storage_key = f"{phase.lower()}_results"
            timestamp = datetime.now().isoformat()
            
            stored_data = {
                "data": data,
                "timestamp": timestamp,
                "phase": phase,
                "version": "1.0"
            }
            
            if storage_key in self.storage:
                self.storage[storage_key][timestamp] = stored_data
            else:
                self.storage[storage_key] = {timestamp: stored_data}
                
            # Save to persistent storage
            await self._persist_storage()
            
            logger.info(f"💾 {phase} phase result stored")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store {phase} result: {e}")
            return False
            
    async def store_handover(self, from_phase: str, to_phase: str, data: Any) -> bool:
        """Store phase handover data."""
        
        if not self.available:
            return await self._store_handover_fallback(from_phase, to_phase, data)
            
        try:
            handover_data = {
                "from_phase": from_phase,
                "to_phase": to_phase,
                "data": data,
                "timestamp": datetime.now().isoformat(),
                "handover_id": f"{from_phase}_{to_phase}_{int(datetime.now().timestamp())}"
            }
            
            self.storage["handovers"].append(handover_data)
            
            # Keep only last 100 handovers
            if len(self.storage["handovers"]) > 100:
                self.storage["handovers"] = self.storage["handovers"][-100:]
                
            await self._persist_storage()
            
            logger.info(f"💾 {from_phase} → {to_phase} handover stored")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store handover: {e}")
            return await self._store_handover_fallback(from_phase, to_phase, data)
            
    async def _store_handover_fallback(self, from_phase: str, to_phase: str, data: Any) -> bool:
        """Fallback handover storage to local files."""
        
        try:
            os.makedirs("rag_storage", exist_ok=True)
            handover_file = f"rag_storage/handover_{from_phase}_{to_phase}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            handover_data = {
                "from_phase": from_phase,
                "to_phase": to_phase,
                "data": data,
                "timestamp": datetime.now().isoformat()
            }
            
            with open(handover_file, 'w', encoding='utf-8') as f:
                json.dump(handover_data, f, indent=2, ensure_ascii=False)
                
            logger.info(f"💾 {from_phase} → {to_phase} handover stored locally")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fallback handover storage failed: {e}")
            return False
            
    async def retrieve_phase_result(self, phase: str, latest: bool = True) -> Optional[Dict[str, Any]]:
        """Retrieve phase execution result."""
        
        if not self.available:
            return None
            
        try:
            storage_key = f"{phase.lower()}_results"
            
            if storage_key not in self.storage or not self.storage[storage_key]:
                return None
                
            if latest:
                # Get most recent result
                latest_timestamp = max(self.storage[storage_key].keys())
                return self.storage[storage_key][latest_timestamp]["data"]
            else:
                # Get all results
                return {
                    timestamp: result["data"]
                    for timestamp, result in self.storage[storage_key].items()
                }
                
        except Exception as e:
            logger.error(f"❌ Failed to retrieve {phase} result: {e}")
            return None
            
    async def retrieve_handover(self, from_phase: str, to_phase: str) -> Optional[Dict[str, Any]]:
        """Retrieve specific handover data."""
        
        if not self.available:
            return None
            
        try:
            # Find matching handover
            for handover in reversed(self.storage["handovers"]):
                if (handover["from_phase"] == from_phase and 
                    handover["to_phase"] == to_phase):
                    return handover["data"]
                    
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve handover: {e}")
            return None
            
    async def search_knowledge(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search stored knowledge base."""
        
        if not self.available:
            return []
            
        try:
            results = []
            query_lower = query.lower()
            
            # Search in all stored data
            for storage_key, storage_data in self.storage.items():
                if storage_key == "handovers":
                    for handover in storage_data:
                        if self._match_query(handover, query_lower):
                            results.append({
                                "type": "handover",
                                "relevance": self._calculate_relevance(handover, query_lower),
                                "data": handover
                            })
                else:
                    for timestamp, result in storage_data.items():
                        if self._match_query(result, query_lower):
                            results.append({
                                "type": "phase_result",
                                "phase": result["phase"],
                                "relevance": self._calculate_relevance(result, query_lower),
                                "data": result
                            })
            
            # Sort by relevance and limit
            results.sort(key=lambda x: x["relevance"], reverse=True)
            return results[:limit]
            
        except Exception as e:
            logger.error(f"❌ Knowledge search failed: {e}")
            return []
            
    def _match_query(self, item: Dict[str, Any], query: str) -> bool:
        """Check if item matches search query."""
        
        try:
            item_text = json.dumps(item).lower()
            return query in item_text
        except:
            return False
            
    def _calculate_relevance(self, item: Dict[str, Any], query: str) -> float:
        """Calculate relevance score for search result."""
        
        try:
            item_text = json.dumps(item).lower()
            query_words = query.split()
            
            total_matches = 0
            for word in query_words:
                total_matches += item_text.count(word)
                
            # Normalize by text length
            relevance = total_matches / max(len(item_text), 1) * 1000
            
            # Boost recent items
            if "timestamp" in item:
                try:
                    timestamp = datetime.fromisoformat(item["timestamp"])
                    age_days = (datetime.now() - timestamp).days
                    age_factor = max(0.1, 1.0 - (age_days / 30))  # Decay over 30 days
                    relevance *= age_factor
                except:
                    pass
                    
            return relevance
            
        except:
            return 0.0
            
    async def _persist_storage(self):
        """Persist storage to disk."""
        
        if self.storage_type == "local_json":
            try:
                storage_file = "rag_storage/genxais_knowledge.json"
                with open(storage_file, 'w', encoding='utf-8') as f:
                    json.dump(self.storage, f, indent=2, ensure_ascii=False)
            except Exception as e:
                logger.error(f"❌ Failed to persist storage: {e}")
                
    async def get_statistics(self) -> Dict[str, Any]:
        """Get RAG system statistics."""
        
        try:
            stats = {
                "storage_type": self.storage_type,
                "available": self.available,
                "total_phase_results": sum(
                    len(results) for key, results in self.storage.items()
                    if key.endswith("_results")
                ),
                "total_handovers": len(self.storage.get("handovers", [])),
                "phase_breakdown": {}
            }
            
            # Phase breakdown
            for key, results in self.storage.items():
                if key.endswith("_results"):
                    phase = key.replace("_results", "").upper()
                    stats["phase_breakdown"][phase] = len(results)
                    
            return stats
            
        except Exception as e:
            logger.error(f"❌ Failed to get statistics: {e}")
            return {"error": str(e)}
            
    async def cleanup_old_data(self, days: int = 30):
        """Clean up old RAG data."""
        
        try:
            cutoff_date = datetime.now().timestamp() - (days * 24 * 60 * 60)
            cleaned_count = 0
            
            # Clean phase results
            for storage_key in list(self.storage.keys()):
                if storage_key.endswith("_results"):
                    storage_data = self.storage[storage_key]
                    to_remove = []
                    
                    for timestamp in storage_data.keys():
                        try:
                            timestamp_dt = datetime.fromisoformat(timestamp)
                            if timestamp_dt.timestamp() < cutoff_date:
                                to_remove.append(timestamp)
                        except:
                            continue
                            
                    for timestamp in to_remove:
                        del storage_data[timestamp]
                        cleaned_count += 1
                        
            # Clean handovers
            original_handovers = len(self.storage.get("handovers", []))
            self.storage["handovers"] = [
                handover for handover in self.storage.get("handovers", [])
                if datetime.fromisoformat(handover["timestamp"]).timestamp() >= cutoff_date
            ]
            cleaned_count += original_handovers - len(self.storage["handovers"])
            
            await self._persist_storage()
            
            logger.info(f"🧹 Cleaned {cleaned_count} old RAG entries")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"❌ RAG cleanup failed: {e}")
            return 0 