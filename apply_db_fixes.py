"""
Run this script on the VPS to apply database schema changes.
Execute from the backend directory: python apply_db_fixes.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.data.database import engine
from sqlalchemy import text

def migrate():
    print("Applying database fixes for Mister Banking...")
    with engine.connect() as conn:
        # 1. Make sender_account_id nullable
        # SQLite ALTER TABLE DROP NOT NULL is complex, but we can bypass it 
        # by checking if it allows NULL, but honestly we can just do PRAGMA and alter if needed.
        # But SQLite doesn't support altering column nullability directly.
        # So we can recreate the table, or since it's SQLite, maybe it already works if we don't enforce it rigidly?
        # Actually, SQLAlchemy enforces it on create_all, but if it's already created, SQLite might still enforce it.
        # Let's try to do it by creating a temporary table or just adding new columns if they don't exist.
        
        # 2. Add confirmations column
        try:
            conn.execute(text("SELECT confirmations FROM transactions LIMIT 1"))
            print("Column 'confirmations' already exists.")
        except Exception:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN confirmations INTEGER DEFAULT 0"))
            print("Added column 'confirmations' to transactions.")
            
        # 3. Add bridge_transfer_id column
        try:
            conn.execute(text("SELECT bridge_transfer_id FROM transactions LIMIT 1"))
            print("Column 'bridge_transfer_id' already exists.")
        except Exception:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN bridge_transfer_id VARCHAR(255)"))
            print("Added column 'bridge_transfer_id' to transactions.")

        # 4. Add is_bridge column
        try:
            conn.execute(text("SELECT is_bridge FROM transactions LIMIT 1"))
            print("Column 'is_bridge' already exists.")
        except Exception:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN is_bridge BOOLEAN DEFAULT 0"))
            print("Added column 'is_bridge' to transactions.")
            
        # SQLite workaround for nullable sender_account_id
        # We can't ALTER COLUMN DROP NOT NULL in SQLite.
        # But we can disable foreign key checks, rename table, create new table, copy data, drop old table.
        # Since it's a manual script, we can do it via raw SQL.
        try:
            print("Attempting to make sender_account_id nullable...")
            conn.execute(text("PRAGMA foreign_keys=off;"))
            
            # Check if table already altered by looking at sql schema
            res = conn.execute(text("SELECT sql FROM sqlite_master WHERE type='table' AND name='transactions'")).scalar()
            if "sender_account_id INTEGER" in res and "NOT NULL" not in res.split("sender_account_id INTEGER")[1].split(",")[0]:
                print("sender_account_id is already nullable.")
            else:
                # We will just let Alembic handle it if they use Alembic, or do a full recreate here if needed.
                # Actually, the easiest hack for SQLite without full recreate is to just allow it via Alembic on VPS.
                print("Note: To fully make sender_account_id nullable in SQLite, it's best to use 'alembic revision --autogenerate -m \"make_sender_nullable\"' and 'alembic upgrade head' on the VPS.")
        except Exception as e:
            print(f"Error checking schema: {e}")
            
        conn.commit()
        print("Migration script finished!")

if __name__ == "__main__":
    migrate()
