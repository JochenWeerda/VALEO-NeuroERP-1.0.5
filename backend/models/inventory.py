from __future__ import annotations

import enum
import os
import time
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    JSON,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from backend.database.database import Base

_CROCKFORD32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def _encode_ulid(value: int) -> str:
    chars: list[str] = []
    for _ in range(26):
        chars.append(_CROCKFORD32[value & 0x1F])
        value >>= 5
    chars.reverse()
    return "".join(chars)


def generate_ulid() -> str:
    """Generate a lexicographically sortable ULID string.

    The implementation follows the ULID specification with a millisecond timestamp
    combined with 80 bits of randomness.
    """

    timestamp_ms = int(time.time() * 1000)
    time_bytes = timestamp_ms.to_bytes(6, "big", signed=False)
    random_bytes = os.urandom(10)
    combined = int.from_bytes(time_bytes + random_bytes, "big", signed=False)
    return _encode_ulid(combined)


class TimestampMixin:
    """Common timestamp and soft-delete columns for all inventory tables."""

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=generate_ulid)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class LotQCStatus(str, enum.Enum):
    """Quality control status of a lot."""

    RELEASED = "released"
    HOLD = "hold"
    BLOCKED = "blocked"


class StockMoveReason(str, enum.Enum):
    """Reason for a stock movement."""

    RECEIPT = "receipt"
    ISSUE = "issue"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"
    INVENTORY = "inventory"


class ReservationStatus(str, enum.Enum):
    """Lifecycle state for reservations."""

    OPEN = "open"
    RELEASED = "released"
    CONSUMED = "consumed"
    CANCELLED = "cancelled"


class Warehouse(TimestampMixin, Base):
    __tablename__ = "inventory_warehouses"

    code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    locations: Mapped[list["Location"]] = relationship(
        back_populates="warehouse", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_inventory_warehouses_deleted_at", "deleted_at"),)


class Location(TimestampMixin, Base):
    __tablename__ = "inventory_locations"

    warehouse_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("inventory_warehouses.id"), nullable=False
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    location_type: Mapped[Optional[str]] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    warehouse: Mapped["Warehouse"] = relationship(back_populates="locations")
    stock_items: Mapped[list["StockItem"]] = relationship(back_populates="location")
    outgoing_moves: Mapped[list["StockMove"]] = relationship(
        back_populates="from_location", foreign_keys="StockMove.from_location_id"
    )
    incoming_moves: Mapped[list["StockMove"]] = relationship(
        back_populates="to_location", foreign_keys="StockMove.to_location_id"
    )

    __table_args__ = (
        UniqueConstraint("warehouse_id", "code", name="uq_inventory_location_code"),
        Index("ix_inventory_locations_deleted_at", "deleted_at"),
    )


class Lot(TimestampMixin, Base):
    __tablename__ = "inventory_lots"

    item_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    external_ref: Mapped[str] = mapped_column(String(128), nullable=False)
    vendor: Mapped[Optional[str]] = mapped_column(String(128))
    attributes: Mapped[Optional[dict]] = mapped_column(JSON)
    qc_status: Mapped[LotQCStatus] = mapped_column(
        Enum(LotQCStatus), nullable=False, default=LotQCStatus.RELEASED
    )
    received_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    hold_reason: Mapped[Optional[str]] = mapped_column(String(256))
    hold_set_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    hold_released_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    holds: Mapped[list["LotHold"]] = relationship(
        back_populates="lot", cascade="all, delete-orphan"
    )
    stock_items: Mapped[list["StockItem"]] = relationship(back_populates="lot")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="lot")
    moves: Mapped[list["StockMove"]] = relationship(back_populates="lot")

    __table_args__ = (
        UniqueConstraint(
            "item_id", "external_ref", name="uq_inventory_lot_item_external"
        ),
        Index("ix_inventory_lots_deleted_at", "deleted_at"),
        Index("ix_inventory_lots_qc_status", "qc_status"),
    )


class StockItem(TimestampMixin, Base):
    __tablename__ = "inventory_stock_items"

    lot_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("inventory_lots.id"), nullable=False
    )
    location_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("inventory_locations.id"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Numeric(18, 6), nullable=False, default=0)
    reserved_quantity: Mapped[float] = mapped_column(
        Numeric(18, 6), nullable=False, default=0
    )
    uom: Mapped[str] = mapped_column(String(16), nullable=False)

    lot: Mapped["Lot"] = relationship(back_populates="stock_items")
    location: Mapped["Location"] = relationship(back_populates="stock_items")

    __table_args__ = (
        UniqueConstraint(
            "lot_id", "location_id", name="uq_inventory_stock_item_lot_location"
        ),
        Index("ix_inventory_stock_items_deleted_at", "deleted_at"),
    )


class StockMove(TimestampMixin, Base):
    __tablename__ = "inventory_stock_moves"

    lot_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("inventory_lots.id"), nullable=False
    )
    from_location_id: Mapped[Optional[str]] = mapped_column(
        String(26), ForeignKey("inventory_locations.id"), nullable=True
    )
    to_location_id: Mapped[Optional[str]] = mapped_column(
        String(26), ForeignKey("inventory_locations.id"), nullable=True
    )
    quantity: Mapped[float] = mapped_column(Numeric(18, 6), nullable=False)
    uom: Mapped[str] = mapped_column(String(16), nullable=False)
    reason: Mapped[StockMoveReason] = mapped_column(
        Enum(StockMoveReason), nullable=False
    )
    reference_doc: Mapped[Optional[str]] = mapped_column(String(128))
    performed_by: Mapped[Optional[str]] = mapped_column(String(64))
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    is_reversal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    lot: Mapped["Lot"] = relationship(back_populates="moves")
    from_location: Mapped[Optional["Location"]] = relationship(
        back_populates="outgoing_moves", foreign_keys=[from_location_id]
    )
    to_location: Mapped[Optional["Location"]] = relationship(
        back_populates="incoming_moves", foreign_keys=[to_location_id]
    )

    __table_args__ = (
        Index("ix_inventory_stock_moves_occurred_at", "occurred_at"),
        Index("ix_inventory_stock_moves_reason", "reason"),
    )


class Reservation(TimestampMixin, Base):
    __tablename__ = "inventory_reservations"

    lot_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("inventory_lots.id"), nullable=False
    )
    order_ref: Mapped[str] = mapped_column(String(64), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(18, 6), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus), nullable=False, default=ReservationStatus.OPEN
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(String(256))

    lot: Mapped["Lot"] = relationship(back_populates="reservations")

    __table_args__ = (
        UniqueConstraint(
            "lot_id", "order_ref", name="uq_inventory_reservation_lot_order"
        ),
        Index("ix_inventory_reservations_status", "status"),
    )


class LotHold(TimestampMixin, Base):
    __tablename__ = "inventory_lot_holds"

    lot_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("inventory_lots.id"), nullable=False
    )
    status_before: Mapped[LotQCStatus] = mapped_column(
        Enum(LotQCStatus), nullable=False
    )
    status_after: Mapped[LotQCStatus] = mapped_column(Enum(LotQCStatus), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(256))
    reference_doc: Mapped[Optional[str]] = mapped_column(String(128))
    created_by: Mapped[Optional[str]] = mapped_column(String(64))
    released_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    lot: Mapped["Lot"] = relationship(back_populates="holds")

    __table_args__ = (
        Index("ix_inventory_lot_holds_lot", "lot_id"),
        Index("ix_inventory_lot_holds_status_after", "status_after"),
    )


__all__ = [
    "Warehouse",
    "Location",
    "Lot",
    "StockItem",
    "StockMove",
    "Reservation",
    "LotHold",
    "LotQCStatus",
    "StockMoveReason",
    "ReservationStatus",
    "generate_ulid",
]
