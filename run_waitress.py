import os
import sys
from waitress import serve
from Appointment.wsgi import application

if __name__ == "__main__":

    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    print("Starting Waitress server...")
    print("Serving on http://localhost:8000")
    print("Press Ctrl+C to stop.")
    
    serve(application, host='0.0.0.0', port=8000, threads=8)
