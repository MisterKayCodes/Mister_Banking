import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_all():
    conn = sqlite3.connect('misterbanking.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT email, password_hash FROM users")
        users = cursor.fetchall()
        print(f"DEBUG: Found {len(users)} users.")
        for email, db_hash in users:
            print(f"USER: {email}")
            for test_pass in ["admin", "johnstones", "password", "123456"]:
                if pwd_context.verify(test_pass, db_hash):
                    print(f"  MATCH FOUND: '{test_pass}'")
                    break
            else:
                print("  NO MATCH FOUND for common passwords.")
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_all()
