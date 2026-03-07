import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_all():
    conn = sqlite3.connect('misterbanking.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT email, password_hash FROM users")
        users = cursor.fetchall()
        print("--- Password Check ---")
        for email, db_hash in users:
            # Check 'admin' password for admin, 'johnstones' for johnstones
            test_pass = "admin" if "admin" in email else "johnstones"
            is_match = pwd_context.verify(test_pass, db_hash)
            print(f"User: {email} | Password: {test_pass} | Match: {is_match}")
            
            # Show the hash for debugging
            print(f"  Hash in DB: {db_hash}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_all()
