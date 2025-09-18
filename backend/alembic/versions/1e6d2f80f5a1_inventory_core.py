"""Inventory core domain tables

Revision ID: 1e6d2f80f5a1
Revises: e77c8a185a46
Create Date: 2025-09-18 10:50:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1e6d2f80f5a1"
down_revision: Union[str, None] = "e77c8a185a46"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


lot_qc_status = sa.Enum("released", "hold", "blocked", name="lotqcstatus")
stock_move_reason = sa.Enum(
    "receipt",
    "issue",
    "transfer",
    "adjustment",
    "inventory",
    name="stockmovereason",
)
reservation_status = sa.Enum(
    "open", "released", "consumed", "cancelled", name="reservationstatus"
)


def upgrade() -> None:
    bind = op.get_bind()
    lot_qc_status.create(bind, checkfirst=True)
    stock_move_reason.create(bind, checkfirst=True)
    reservation_status.create(bind, checkfirst=True)

    op.create_table(
        "inventory_warehouses",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("code", sa.String(length=32), nullable=False, unique=True),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("description", sa.String(length=256), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index(
        "ix_inventory_warehouses_deleted_at",
        "inventory_warehouses",
        ["deleted_at"],
    )

    op.create_table(
        "inventory_locations",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("warehouse_id", sa.String(length=26), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("location_type", sa.String(length=32), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(
            ["warehouse_id"],
            ["inventory_warehouses.id"],
            name="fk_inventory_locations_warehouse",
        ),
        sa.UniqueConstraint("warehouse_id", "code", name="uq_inventory_location_code"),
    )
    op.create_index(
        "ix_inventory_locations_deleted_at",
        "inventory_locations",
        ["deleted_at"],
    )

    op.create_table(
        "inventory_lots",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("item_id", sa.String(length=64), nullable=False),
        sa.Column("external_ref", sa.String(length=128), nullable=False),
        sa.Column("vendor", sa.String(length=128), nullable=True),
        sa.Column("attributes", sa.JSON(), nullable=True),
        sa.Column(
            "qc_status", lot_qc_status, nullable=False, server_default="released"
        ),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hold_reason", sa.String(length=256), nullable=True),
        sa.Column("hold_set_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hold_released_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint(
            "item_id", "external_ref", name="uq_inventory_lot_item_external"
        ),
    )
    op.create_index("ix_inventory_lots_deleted_at", "inventory_lots", ["deleted_at"])
    op.create_index("ix_inventory_lots_qc_status", "inventory_lots", ["qc_status"])
    op.create_index("ix_inventory_lots_item", "inventory_lots", ["item_id"])

    op.create_table(
        "inventory_stock_items",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lot_id", sa.String(length=26), nullable=False),
        sa.Column("location_id", sa.String(length=26), nullable=False),
        sa.Column("quantity", sa.Numeric(18, 6), nullable=False, server_default="0"),
        sa.Column("uom", sa.String(length=16), nullable=False),
        sa.ForeignKeyConstraint(
            ["lot_id"], ["inventory_lots.id"], name="fk_inventory_stock_item_lot"
        ),
        sa.ForeignKeyConstraint(
            ["location_id"],
            ["inventory_locations.id"],
            name="fk_inventory_stock_item_location",
        ),
        sa.UniqueConstraint(
            "lot_id", "location_id", name="uq_inventory_stock_item_lot_location"
        ),
    )
    op.create_index(
        "ix_inventory_stock_items_deleted_at",
        "inventory_stock_items",
        ["deleted_at"],
    )

    op.create_table(
        "inventory_reservations",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lot_id", sa.String(length=26), nullable=False),
        sa.Column("order_ref", sa.String(length=64), nullable=False),
        sa.Column("quantity", sa.Numeric(18, 6), nullable=False),
        sa.Column("status", reservation_status, nullable=False, server_default="open"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.String(length=256), nullable=True),
        sa.ForeignKeyConstraint(
            ["lot_id"], ["inventory_lots.id"], name="fk_inventory_reservation_lot"
        ),
        sa.UniqueConstraint(
            "lot_id", "order_ref", name="uq_inventory_reservation_lot_order"
        ),
    )
    op.create_index(
        "ix_inventory_reservations_status",
        "inventory_reservations",
        ["status"],
    )

    op.create_table(
        "inventory_stock_moves",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lot_id", sa.String(length=26), nullable=False),
        sa.Column("from_location_id", sa.String(length=26), nullable=True),
        sa.Column("to_location_id", sa.String(length=26), nullable=True),
        sa.Column("quantity", sa.Numeric(18, 6), nullable=False),
        sa.Column("uom", sa.String(length=16), nullable=False),
        sa.Column("reason", stock_move_reason, nullable=False),
        sa.Column("reference_doc", sa.String(length=128), nullable=True),
        sa.Column("performed_by", sa.String(length=64), nullable=True),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "is_reversal", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.ForeignKeyConstraint(
            ["lot_id"], ["inventory_lots.id"], name="fk_inventory_stock_move_lot"
        ),
        sa.ForeignKeyConstraint(
            ["from_location_id"],
            ["inventory_locations.id"],
            name="fk_inventory_stock_move_from",
        ),
        sa.ForeignKeyConstraint(
            ["to_location_id"],
            ["inventory_locations.id"],
            name="fk_inventory_stock_move_to",
        ),
    )
    op.create_index(
        "ix_inventory_stock_moves_occurred_at",
        "inventory_stock_moves",
        ["occurred_at"],
    )
    op.create_index(
        "ix_inventory_stock_moves_reason",
        "inventory_stock_moves",
        ["reason"],
    )

    op.create_table(
        "inventory_lot_holds",
        sa.Column("id", sa.String(length=26), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lot_id", sa.String(length=26), nullable=False),
        sa.Column("status_before", lot_qc_status, nullable=False),
        sa.Column("status_after", lot_qc_status, nullable=False),
        sa.Column("reason", sa.String(length=256), nullable=True),
        sa.Column("reference_doc", sa.String(length=128), nullable=True),
        sa.Column("created_by", sa.String(length=64), nullable=True),
        sa.Column("released_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["lot_id"], ["inventory_lots.id"], name="fk_inventory_lot_hold_lot"
        ),
    )
    op.create_index("ix_inventory_lot_holds_lot", "inventory_lot_holds", ["lot_id"])
    op.create_index(
        "ix_inventory_lot_holds_status_after", "inventory_lot_holds", ["status_after"]
    )


def downgrade() -> None:
    op.drop_index(
        "ix_inventory_lot_holds_status_after", table_name="inventory_lot_holds"
    )
    op.drop_index("ix_inventory_lot_holds_lot", table_name="inventory_lot_holds")
    op.drop_table("inventory_lot_holds")

    op.drop_index("ix_inventory_stock_moves_reason", table_name="inventory_stock_moves")
    op.drop_index(
        "ix_inventory_stock_moves_occurred_at", table_name="inventory_stock_moves"
    )
    op.drop_table("inventory_stock_moves")

    op.drop_index(
        "ix_inventory_reservations_status", table_name="inventory_reservations"
    )
    op.drop_table("inventory_reservations")

    op.drop_index(
        "ix_inventory_stock_items_deleted_at", table_name="inventory_stock_items"
    )
    op.drop_table("inventory_stock_items")

    op.drop_index("ix_inventory_lots_item", table_name="inventory_lots")
    op.drop_index("ix_inventory_lots_qc_status", table_name="inventory_lots")
    op.drop_index("ix_inventory_lots_deleted_at", table_name="inventory_lots")
    op.drop_table("inventory_lots")

    op.drop_index("ix_inventory_locations_deleted_at", table_name="inventory_locations")
    op.drop_table("inventory_locations")

    op.drop_index(
        "ix_inventory_warehouses_deleted_at", table_name="inventory_warehouses"
    )
    op.drop_table("inventory_warehouses")

    bind = op.get_bind()
    reservation_status.drop(bind, checkfirst=True)
    stock_move_reason.drop(bind, checkfirst=True)
    lot_qc_status.drop(bind, checkfirst=True)
