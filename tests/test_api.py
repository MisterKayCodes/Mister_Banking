import requests
import json

BASE_URL = "http://127.0.0.1:8000" # Localhost since we're on the same machine

def test_login_and_me():
    # 1. Login to get token
    login_data = {"email": "admin@gmail.com", "password": "admin"}
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        response.raise_for_status()
        token = response.json()["access_token"]
        print(f"Token acquired. Mister, we're in.")
        
        # 2. Call /users/me
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        if response.status_code != 200:
            print(f"Me Error Content: {response.text}")
        response.raise_for_status()
        data = response.json()
        
        print(f"Profile Payload: {json.dumps(data, indent=2)}")
        
        # 3. Call /accounts/
        response = requests.get(f"{BASE_URL}/accounts/", headers=headers)
        response.raise_for_status()
        accounts = response.json()
        print(f"Accounts Payload: {json.dumps(accounts, indent=2)}")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_login_and_me()
