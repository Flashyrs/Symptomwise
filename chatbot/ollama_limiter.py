import threading
import os

# Limit concurrent requests to Ollama to prevent system overload
# Default to 2, which is safe for most laptops. Increase if you have a powerful GPU.
MAX_CONCURRENT_REQUESTS = int(os.environ.get('OLLAMA_MAX_CONCURRENT', 2))

ollama_semaphore = threading.Semaphore(MAX_CONCURRENT_REQUESTS)
