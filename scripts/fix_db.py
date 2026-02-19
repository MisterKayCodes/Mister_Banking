import sqlite3
import os

DB_PATH = r"C:\Kaycris\Mister_Banking\misterbanking.db" 

def sync_account_numbers():
    if not os.path.exists(DB_PATH):
        print(f"Mister, I can't find the vault at {DB_PATH}.")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        print("Mister, I'm matching internal IDs to 10-digit numbers...")

        # ## Logic: Update the 'sender_no' by looking it up in the accounts table
        cursor.execute("""
            UPDATE transactions 
            SET sender_no = (
                SELECT account_number FROM accounts 
                WHERE accounts.id = transactions.sender_account_id
            )
            WHERE sender_no IS NULL;
        """)

        # ## Logic: Update the 'receiver_no' for internal transfers
        cursor.execute("""
            UPDATE transactions 
            SET receiver_no = (
                SELECT account_number FROM accounts 
                WHERE accounts.id = transactions.receiver_account_id
            )
            WHERE receiver_no IS NULL AND receiver_account_id IS NOT NULL;
        """)
        
        conn.commit()
        print(f"Vault synchronized! {cursor.rowcount} records updated.")
        conn.close()
        
    except Exception as e:
        print(f"Error during synchronization: {e}")

if __name__ == "__main__":
    sync_account_numbers()