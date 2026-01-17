import threading
import time

# Simple in-memory cache for AI responses
# Format: { 'prompt_hash': {'response': '...', 'timestamp': 12345} }
_ai_cache = {}
_cache_lock = threading.Lock()

CACHE_TTL = 3600 * 24  # 24 hours (Long cache for demo purposes)

def get_cached_response(prompt_text):
    """Retrieve response from cache if it exists and hasn't expired."""
    # Simple normalization
    key = prompt_text.strip().lower()
    
    with _cache_lock:
        data = _ai_cache.get(key)
        if data:
            if time.time() - data['timestamp'] < CACHE_TTL:
                return data['response']
            else:
                del _ai_cache[key]
    return None

def set_cached_response(prompt_text, response_text):
    """Store response in cache."""
    key = prompt_text.strip().lower()
    
    with _cache_lock:
        # Prevent cache from growing infinitely
        if len(_ai_cache) > 1000:
            # Simple eviction: clear 20% of keys (not true LRU but fast)
            keys_to_remove = list(_ai_cache.keys())[:200]
            for k in keys_to_remove:
                del _ai_cache[k]
                
        _ai_cache[key] = {
            'response': response_text,
            'timestamp': time.time()
        }
