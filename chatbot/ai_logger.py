import os
import datetime
import time
from django.conf import settings

def log_ai_interaction(source, status, duration, response_preview, error=None):
    """Log AI interactions to a file for performance tracking."""
    try:
        log_path = os.path.join(settings.BASE_DIR, 'ai_debug.log')
        timestamp = datetime.datetime.now().isoformat()
        
        with open(log_path, "a", encoding="utf-8") as f:
            if status == "SUCCESS":
                f.write(f"[{timestamp}] [{source}] SUCCESS ({duration:.2f}s): {response_preview}\n")
            else:
                f.write(f"[{timestamp}] [{source}] ERROR ({duration:.2f}s): {error}\n")
    except Exception as e:
        # Don't let logging fail the request
        print(f"Logging failed: {e}")
