from __future__ import annotations

from decimal import Decimal
from pathlib import Path
from time import perf_counter
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest  # noqa: E402
from sqlalchemy import create_engine, inspect  # noqa: E402
from sqlalchemy.exc import IntegrityError  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from backend.database.database import Base  # noqa: E402
from backend.models.inventory import (  # noqa: E402
    Location,
    Lot,
    LotHold,
    LotQCStatus,
    Reservation,
    ReservationStatus,
    StockItem,
    StockMove,
    StockMoveReason,
    Warehouse,
    generate_ulid,
)


@pytest.fixture()
def inventory_session() -> Session:
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    testing_session = sessionmaker(bind=engine, future=True)
    session = testing_session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def _prepare_core_entities(session: Session) -> tuple[Warehouse, Location, Lot]:
    warehouse = Warehouse(code="WH-DE-001", name="Hauptlager Nord")
    session.add(warehouse)
    session.flush()

    location = Location(warehouse_id=warehouse.id, code="A-01", name="Regal A-01")
    session.add(location)
    session.flush()

    lot = Lot(item_id="ITEM-001", external_ref="BATCH-001")
    session.add(lot)
    session.flush()

    return warehouse, location, lot


def test_generate_ulid_returns_crockford_identifier() -> None:
    value = generate_ulid()
    assert len(value) == 26
    assert value.upper() == value
    assert value.isalnum()


def test_stock_item_unique_constraint(inventory_session: Session) -> None:
    _, location, lot = _prepare_core_entities(inventory_session)

    stock = StockItem(
        lot_id=lot.id,
        location_id=location.id,
        quantity=Decimal("10.000"),
        uom="kg",
    )
    inventory_session.add(stock)
    inventory_session.commit()

    duplicate = StockItem(
        lot_id=lot.id,
        location_id=location.id,
        quantity=Decimal("1.000"),
        uom="kg",
    )
    inventory_session.add(duplicate)

    with pytest.raises(IntegrityError):
        inventory_session.commit()
    inventory_session.rollback()


def test_reservation_unique_constraint(inventory_session: Session) -> None:
    _, _, lot = _prepare_core_entities(inventory_session)

    reservation = Reservation(
        lot_id=lot.id,
        order_ref="ORD-1000",
        quantity=Decimal("5"),
    )
    inventory_session.add(reservation)
    inventory_session.commit()

    duplicate = Reservation(
        lot_id=lot.id,
        order_ref="ORD-1000",
        quantity=Decimal("1"),
    )
    inventory_session.add(duplicate)

    with pytest.raises(IntegrityError):
        inventory_session.commit()
    inventory_session.rollback()


def test_lot_hold_history_records_changes(inventory_session: Session) -> None:
    _, _, lot = _prepare_core_entities(inventory_session)

    hold_entry = LotHold(
        lot_id=lot.id,
        status_before=LotQCStatus.RELEASED,
        status_after=LotQCStatus.HOLD,
        reason="QS-Incoming deviation",
    )
    inventory_session.add(hold_entry)
    inventory_session.commit()

    fetched = inventory_session.get(Lot, lot.id)
    assert fetched is not None
    assert fetched.holds[0].status_after is LotQCStatus.HOLD


def test_bulk_insert_stock_moves_meets_benchmark(inventory_session: Session) -> None:
    _, location, lot = _prepare_core_entities(inventory_session)

    start = perf_counter()
    moves = [
        StockMove(
            lot_id=lot.id,
            to_location_id=location.id,
            quantity=Decimal("1"),
            uom="kg",
            reason=StockMoveReason.RECEIPT,
        )
        for _ in range(10_000)
    ]
    inventory_session.bulk_save_objects(moves)
    inventory_session.commit()
    runtime_seconds = perf_counter() - start

    count = inventory_session.query(StockMove).count()
    assert count == 10_000
    assert runtime_seconds < 60


def test_soft_delete_columns_present() -> None:
    mapper = inspect(Warehouse)
    column_names = {column.key for column in mapper.columns}
    assert {"created_at", "updated_at", "deleted_at"}.issubset(column_names)

    mapper_location = inspect(Location)
    column_names_location = {column.key for column in mapper_location.columns}
    assert "deleted_at" in column_names_location

    mapper_lot = inspect(Lot)
    column_names_lot = {column.key for column in mapper_lot.columns}
    assert "deleted_at" in column_names_lot

    mapper_stock = inspect(StockItem)
    column_names_stock = {column.key for column in mapper_stock.columns}
    assert "deleted_at" in column_names_stock


def test_default_reservation_status(inventory_session: Session) -> None:
    _, _, lot = _prepare_core_entities(inventory_session)
    reservation = Reservation(
        lot_id=lot.id, order_ref="ORD-2000", quantity=Decimal("1")
    )
    inventory_session.add(reservation)
    inventory_session.flush()
    assert reservation.status is ReservationStatus.OPEN
