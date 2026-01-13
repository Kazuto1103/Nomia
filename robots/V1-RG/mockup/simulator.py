import asyncio
import json
import requests
import time

# Configuration
API_URL = "http://localhost:8080/command"
MOCK_DATA_FILE = "d:/Project/Nomia/mockup/telemetry_mock.json"

def load_mock_data():
    with open(MOCK_DATA_FILE, 'r') as f:
        return json.load(f)

async def simulate_system():
    data = load_mock_data()
    states = list(data['states'].keys())
    
    print("V1-RG MOCKUP DATA SIMULATOR STARTED")
    print("-----------------------------------")
    
    while True:
        for state_name in states:
            state_data = data['states'][state_name]
            print(f"Switching to state: {state_name}")
            
            # Since our backend handles mode switches, we'll send a command to simulate activity
            # The backend itself (main.py) is already designed to broadcast data, 
            # so we'll just force a mode switch to see the logs and UI react.
            try:
                # Trigger mode change on the real backend
                requests.post(API_URL, json={
                    "action": "CMD_MODE",
                    "value": state_data['mode']
                })
                
                # We also want to see custom logs
                # For this simple mock script, we'll just log success locally
                # In a real integration, the backend would generate these logs
                pass
            except Exception as e:
                print(f"Error connecting to backend: {e}")
            
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(simulate_system())
