import requests
import json

def test_python_api():
    """Simple script to test the Python API"""
    
    try:
        print("🔍 Testing events API...")
        
        # Test events endpoint
        response = requests.get("http://localhost:8000/api/events")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            print(f"✅ Events found: {len(events)}")
            
            if events:
                print("\n📋 First event details:")
                first_event = events[0]
                print(json.dumps(first_event, indent=2, ensure_ascii=False))
                
                # Check valid ID
                event_id = first_event.get('id')
                print(f"\n🆔 Event ID: {event_id} (type: {type(event_id)})")
            else:
                print("⚠️  No events stored in the database")
        else:
            print(f"❌ API error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the Python server on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_python_api()
