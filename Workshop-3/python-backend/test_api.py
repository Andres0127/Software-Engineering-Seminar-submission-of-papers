import requests
import json

def test_python_api():
    """Script simple para probar la API de Python"""
    
    try:
        print("🔍 Probando API de eventos...")
        
        # Probar endpoint de eventos
        response = requests.get("http://localhost:8000/api/events")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            print(f"✅ Eventos encontrados: {len(events)}")
            
            if events:
                print("\n📋 Primer evento:")
                first_event = events[0]
                print(json.dumps(first_event, indent=2, ensure_ascii=False))
                
                # Verificar que tenga ID válido
                event_id = first_event.get('id')
                print(f"\n🆔 ID del primer evento: {event_id} (tipo: {type(event_id)})")
            else:
                print("⚠️  No hay eventos en la base de datos")
        else:
            print(f"❌ Error en API: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al servidor Python en puerto 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_python_api()
