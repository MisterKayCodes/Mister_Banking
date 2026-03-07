import sqlite3

def check_db(path):
    print(f"--- Checking {path} ---")
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email, full_name FROM users")
        users = cursor.fetchall()
        if not users:
            print("  No users found.")
        for u in users:
            print(f"  Email: {u[0]} | Name: {u[1]}")
    except Exception as e:
        print(f"  Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_db('misterbanking.db')
    check_db('app/data/misterbanking.db')
