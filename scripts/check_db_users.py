import sqlite3

def check_users():
    conn = sqlite3.connect('misterbanking.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, email, full_name, is_admin FROM users")
        users = cursor.fetchall()
        print("--- Existing Users ---")
        for u in users:
            print(f"ID: {u[0]} | Email: {u[1]} | Name: {u[2]} | Admin: {u[3]}")
    except Exception as e:
        print(f"Error reading users: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_users()
