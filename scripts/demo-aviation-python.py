import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def check_flights():
    api_key = os.getenv("AVIATIONSTACK_API_KEY")

    if not api_key or api_key == "PASTE_AVIATIONSTACK_KEY_HERE":
        raise ValueError("Missing AVIATIONSTACK_API_KEY. Please check your .env file and replace the placeholder.")

    print(f"Using API Key: {api_key[:4]}...")

    url = "https://api.aviationstack.com/v1/flights"
    params = {
        "access_key": api_key,
        "limit": 5
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        count = data.get('pagination', {}).get('count', 'N/A')
        print("API Request Successful!")
        print(f"Flights fetched: {count}")
        
    except requests.exceptions.RequestException as e:
        print(f"API Request Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"Response: {e.response.text}")

if __name__ == "__main__":
    try:
        check_flights()
    except Exception as e:
        print(f"Error: {e}")
