from logging.config import fileConfig
import os
import sys

# ## Mister, we need to add the current directory to the path so we can find 'app'
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# ## Import our database base and models for autogenerate support
from app.data.database import Base, DATABASE_URL
# ## -------------------- THE MISTER REGISTRY --------------------
# ## We must import EVERY model file here so Base.metadata knows they exist.
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.system_config import SystemConfig
from app.models.audit_log import AuditLog
from app.models.support import SupportMessage    # ## RESTORED
from app.models.kyc import KYCRequirement, KYCSubmission # ## NEW
from app.models.wallet import Wallet
from app.models.notification import Notification
# ## -------------------------------------------------------------

# this is the Alembic Config object
config = context.config

# ## Setting the sqlalchemy.url dynamically from our database config, Mister.
config.set_main_option("sqlalchemy.url", DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ## Pointing Alembic to our models' metadata
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    # ## Mister, we use the dynamic URL here too.
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = DATABASE_URL
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            # ## Critical for SQLite: allows renaming/altering columns
            render_as_batch=True 
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()