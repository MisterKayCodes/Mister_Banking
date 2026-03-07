from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.data.database import DATABASE_URL
from app.models.user import User
from app.models.account import Account
from app.models.wallet import Wallet

def check_data():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"User: {u.full_name} ({u.email}), ID: {u.id}")
        accounts = db.query(Account).filter(Account.user_id == u.id).all()
        print(f"  Accounts: {len(accounts)}")
        wallet = db.query(Wallet).filter(Wallet.user_id == u.id).first()
        print(f"  Wallet: {'Yes' if wallet else 'No'}")
    
    db.close()

if __name__ == "__main__":
    check_data()
