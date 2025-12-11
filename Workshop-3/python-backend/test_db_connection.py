"""
Script simple para verificar la conexión a PostgreSQL
"""
import psycopg2
from psycopg2 import OperationalError

def test_connection():
    try:
        # Intentar conectar a PostgreSQL
        connection = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="200127",
            database="eventplatform"
        )
        
        print("✅ Conexión exitosa a PostgreSQL!")
        
        # Crear cursor
        cursor = connection.cursor()
        
        # Verificar si existen tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        if tables:
            print(f"\n📊 Tablas encontradas ({len(tables)}):")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Contar eventos
            cursor.execute("SELECT COUNT(*) FROM events;")
            event_count = cursor.fetchone()[0]
            print(f"\n🎫 Total de eventos en la base de datos: {event_count}")
            
            if event_count > 0:
                # Mostrar algunos eventos
                cursor.execute("SELECT id, name, date FROM events LIMIT 5;")
                events = cursor.fetchall()
                print("\n📋 Primeros 5 eventos:")
                for event in events:
                    print(f"  ID: {event[0]}, Nombre: {event[1]}, Fecha: {event[2]}")
            else:
                print("\n⚠️  La tabla 'events' existe pero está vacía!")
                print("   Necesitas ejecutar los scripts SQL para poblar la base de datos.")
        else:
            print("\n⚠️  No se encontraron tablas en la base de datos!")
            print("   Necesitas ejecutar los scripts SQL de inicialización:")
            print("   1. scripts/01-create-database.sql")
            print("   2. scripts/02-setup-schema-and-data.sql")
        
        cursor.close()
        connection.close()
        
    except OperationalError as e:
        if "does not exist" in str(e):
            print("❌ Error: La base de datos 'eventplatform' no existe!")
            print("\n📝 Pasos para crear la base de datos:")
            print("   1. Abre pgAdmin")
            print("   2. Click derecho en 'Databases' -> Create -> Database")
            print("   3. Nombre: eventplatform")
            print("   4. Owner: postgres")
            print("   5. Ejecuta los scripts SQL en scripts/")
        elif "password authentication failed" in str(e):
            print("❌ Error: Contraseña incorrecta!")
            print(f"   Verifica que la contraseña sea: 200127")
        else:
            print(f"❌ Error de conexión: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    print("🔍 Verificando conexión a PostgreSQL...\n")
    test_connection()
