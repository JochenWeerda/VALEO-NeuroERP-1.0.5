"""
Query Optimizer für optimierte Datenbankabfragen
"""
from typing import Any, Dict, List, Optional, Tuple, Union
import logging
from sqlalchemy import text, select, func
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.cache_manager import cache_manager

logger = logging.getLogger("query-optimizer")

class QueryOptimizer:
    """
    Query Optimizer für effiziente Datenbankabfragen
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.cache = cache_manager
        
    async def optimize_query(self, query: Any) -> Any:
        """
        Optimiert eine Datenbankabfrage
        
        - Fügt Index-Hints hinzu
        - Optimiert JOINs
        - Nutzt Eager Loading wo sinnvoll
        """
        # Query-Plan analysieren
        plan = await self._analyze_query(query)
        
        # Optimierungen anwenden
        optimized = await self._apply_optimizations(query, plan)
        
        return optimized
        
    async def _analyze_query(self, query: Any) -> Dict[str, Any]:
        """Analysiert den Query-Plan"""
        try:
            # EXPLAIN ANALYZE ausführen
            explain = await self.session.execute(
                text(f"EXPLAIN ANALYZE {str(query)}")
            )
            plan = explain.fetchall()
            
            return self._parse_explain_output(plan)
            
        except Exception as e:
            logger.error(f"Query-Analyse fehlgeschlagen: {str(e)}")
            return {}
            
    def _parse_explain_output(self, plan: List[Tuple]) -> Dict[str, Any]:
        """Parst die EXPLAIN ANALYZE Ausgabe"""
        result = {
            "sequential_scans": 0,
            "index_scans": 0,
            "joins": [],
            "filters": [],
            "sort_operations": [],
            "estimated_rows": 0,
            "actual_rows": 0,
            "execution_time": 0
        }
        
        for row in plan:
            line = row[0]
            
            # Scans erkennen
            if "Seq Scan" in line:
                result["sequential_scans"] += 1
            elif "Index Scan" in line:
                result["index_scans"] += 1
                
            # JOINs erkennen
            if "Join" in line:
                join_type = line.split()[0]
                result["joins"].append(join_type)
                
            # Filter erkennen
            if "Filter:" in line:
                filter_cond = line.split("Filter: ")[1]
                result["filters"].append(filter_cond)
                
            # Sortierungen erkennen
            if "Sort" in line:
                sort_key = line.split("Sort Key: ")[1]
                result["sort_operations"].append(sort_key)
                
            # Zeilen und Zeit extrahieren
            if "rows=" in line:
                result["estimated_rows"] = int(line.split("rows=")[1].split()[0])
            if "actual rows=" in line:
                result["actual_rows"] = int(line.split("actual rows=")[1].split()[0])
            if "actual time=" in line:
                result["execution_time"] = float(line.split("actual time=")[1].split()[0])
                
        return result
        
    async def _apply_optimizations(self, query: Any, plan: Dict[str, Any]) -> Any:
        """Wendet Optimierungen basierend auf der Analyse an"""
        optimized = query
        
        # Sequential Scans reduzieren
        if plan.get("sequential_scans", 0) > 0:
            optimized = await self._optimize_scans(optimized, plan)
            
        # JOINs optimieren
        if plan.get("joins"):
            optimized = await self._optimize_joins(optimized, plan)
            
        # Sortierungen optimieren
        if plan.get("sort_operations"):
            optimized = await self._optimize_sorts(optimized, plan)
            
        return optimized
        
    async def _optimize_scans(self, query: Any, plan: Dict[str, Any]) -> Any:
        """Optimiert Sequential Scans"""
        # Index-Hints hinzufügen
        if hasattr(query, "statement"):
            stmt = query.statement
            if hasattr(stmt, "froms"):
                for table in stmt.froms:
                    if hasattr(table, "name"):
                        # Prüfen ob Index existiert
                        indexes = await self._get_table_indexes(table.name)
                        if indexes:
                            # Passenden Index wählen
                            best_index = self._select_best_index(indexes, plan)
                            if best_index:
                                # Index-Hint hinzufügen
                                query = query.with_hint(
                                    table,
                                    f"INDEX ({best_index})",
                                    "postgresql"
                                )
        return query
        
    async def _optimize_joins(self, query: Any, plan: Dict[str, Any]) -> Any:
        """Optimiert JOINs"""
        # Eager Loading für häufig benötigte Beziehungen
        if hasattr(query, "statement"):
            stmt = query.statement
            if hasattr(stmt, "froms"):
                for table in stmt.froms:
                    if hasattr(table, "name"):
                        # Beziehungen analysieren
                        relations = await self._get_table_relations(table.name)
                        for relation in relations:
                            if self._should_eager_load(relation, plan):
                                # Eager Loading hinzufügen
                                query = query.options(
                                    selectinload(relation)
                                )
        return query
        
    async def _optimize_sorts(self, query: Any, plan: Dict[str, Any]) -> Any:
        """Optimiert Sortierungen"""
        # Index für Sortierung nutzen
        if plan.get("sort_operations"):
            for sort_op in plan["sort_operations"]:
                sort_columns = sort_op.split(", ")
                # Index für Sortierfelder prüfen
                indexes = await self._get_table_indexes(query.statement.froms[0].name)
                best_index = self._find_matching_index(indexes, sort_columns)
                if best_index:
                    # Index-Hint für Sortierung
                    query = query.with_hint(
                        query.statement.froms[0],
                        f"INDEX ({best_index})",
                        "postgresql"
                    )
        return query
        
    async def _get_table_indexes(self, table_name: str) -> List[str]:
        """Holt die verfügbaren Indizes einer Tabelle"""
        try:
            # Cache-Key erstellen
            cache_key = f"table_indexes:{table_name}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached is not None:
                return cached
                
            # Aus Datenbank lesen
            result = await self.session.execute(
                text(f"""
                    SELECT indexname 
                    FROM pg_indexes 
                    WHERE tablename = :table
                """),
                {"table": table_name}
            )
            indexes = [row[0] for row in result.fetchall()]
            
            # In Cache schreiben
            await self.cache.set(cache_key, indexes, ttl=3600)
            
            return indexes
            
        except Exception as e:
            logger.error(f"Fehler beim Lesen der Indizes: {str(e)}")
            return []
            
    async def _get_table_relations(self, table_name: str) -> List[str]:
        """Holt die Beziehungen einer Tabelle"""
        try:
            # Cache-Key erstellen
            cache_key = f"table_relations:{table_name}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached is not None:
                return cached
                
            # Aus Datenbank lesen
            result = await self.session.execute(
                text(f"""
                    SELECT
                        tc.table_schema, 
                        tc.constraint_name, 
                        tc.table_name, 
                        kcu.column_name, 
                        ccu.table_schema AS foreign_table_schema,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name 
                    FROM 
                        information_schema.table_constraints AS tc 
                        JOIN information_schema.key_column_usage AS kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        JOIN information_schema.constraint_column_usage AS ccu
                          ON ccu.constraint_name = tc.constraint_name
                          AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_name = :table
                """),
                {"table": table_name}
            )
            relations = [row[5] for row in result.fetchall()]
            
            # In Cache schreiben
            await self.cache.set(cache_key, relations, ttl=3600)
            
            return relations
            
        except Exception as e:
            logger.error(f"Fehler beim Lesen der Beziehungen: {str(e)}")
            return []
            
    def _select_best_index(
        self,
        indexes: List[str],
        plan: Dict[str, Any]
    ) -> Optional[str]:
        """Wählt den besten Index basierend auf dem Query-Plan"""
        if not indexes:
            return None
            
        # Filter analysieren
        filters = plan.get("filters", [])
        if not filters:
            return indexes[0]
            
        # Index mit den meisten übereinstimmenden Spalten wählen
        best_match = None
        best_score = 0
        
        for index in indexes:
            score = self._calculate_index_score(index, filters)
            if score > best_score:
                best_score = score
                best_match = index
                
        return best_match
        
    def _calculate_index_score(self, index: str, filters: List[str]) -> int:
        """Berechnet einen Score für die Index-Filter-Übereinstimmung"""
        score = 0
        # Index-Spalten extrahieren
        index_columns = index.lower().replace("_idx", "").split("_")
        
        for filter_cond in filters:
            filter_col = filter_cond.split()[0].lower()
            if filter_col in index_columns:
                score += 1
                
        return score
        
    def _find_matching_index(
        self,
        indexes: List[str],
        sort_columns: List[str]
    ) -> Optional[str]:
        """Findet einen passenden Index für die Sortierung"""
        if not indexes or not sort_columns:
            return None
            
        # Normalisierte Spaltennamen
        sort_cols = [col.strip().lower() for col in sort_columns]
        
        # Exakte Übereinstimmung suchen
        for index in indexes:
            index_cols = index.lower().replace("_idx", "").split("_")
            if index_cols == sort_cols:
                return index
                
        # Teilweise Übereinstimmung
        best_match = None
        best_score = 0
        
        for index in indexes:
            index_cols = index.lower().replace("_idx", "").split("_")
            score = sum(1 for col in sort_cols if col in index_cols)
            if score > best_score:
                best_score = score
                best_match = index
                
        return best_match
        
    def _should_eager_load(self, relation: str, plan: Dict[str, Any]) -> bool:
        """Entscheidet ob Eager Loading sinnvoll ist"""
        # Wenn viele Zeilen betroffen sind
        if plan.get("estimated_rows", 0) > 1000:
            return False
            
        # Wenn die Relation in JOINs vorkommt
        if relation.lower() in str(plan.get("joins", [])).lower():
            return True
            
        return False
        
# Export
__all__ = ["QueryOptimizer"] 