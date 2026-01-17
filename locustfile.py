import time
from locust import HttpUser, task, between

class SymptomWiseUser(HttpUser):
    host = "http://127.0.0.1:8000"
    weight = 3
    wait_time = between(2, 5)

    @task(3)
    def view_home(self):
        self.client.get("/")

    @task(2)
    def view_doctors(self):
        self.client.get("/doctors/")

    @task(1)
    def view_chatbot(self):
        self.client.get("/chatbot/")

    @task(1)
    def whatsapp_webhook_simulation(self):
        # Simulate a WhatsApp incoming message
        payload = {
            "From": "whatsapp:+1234567890",
            "Body": "I have a headache and fever",
        }
        # We expect a 200 OK XML response
        self.client.post("/chatbot/whatsapp/", data=payload, name="/chatbot/whatsapp/ (Webhook)")

    def on_start(self):
        # Optional: Log in if needed, but for public pages we don't need to
        pass

class ChatbotStressUser(HttpUser):
    host = "http://127.0.0.1:8000"
    weight = 1
    wait_time = between(5, 10)  # Slower wait time for AI processing
    
    @task
    def whatsapp_ai_stress(self):
        import random
        
        # 80% of traffic comes from these 10 common queries (CACHE HIT)
        common_symptoms = [
            "I have a fever and headache",
            "Severe chest pain",
            "I am coughing a lot",
            "Stomach pain after eating",
            "Dizziness and nausea",
            "My throat hurts",
            "I cut my finger, it is bleeding",
            "Back pain",
            "I feel anxious",
            "Blurry vision"
        ]
        
        if random.random() < 0.8:
            # Common query - Should hit cache and return in <0.1s
            symptom = random.choice(common_symptoms)
            label = "/chatbot/whatsapp/ (Common/Cached)"
        else:
            # Unique query - Will hit AI and take ~2s
            symptom = random.choice(common_symptoms) + f" details: {random.randint(1, 10000)}"
            label = "/chatbot/whatsapp/ (Unique/AI)"
        
        payload = {
            "From": f"whatsapp:+1{random.randint(1000000000, 9999999999)}",
            "Body": symptom,
        }
        
        self.client.post("/chatbot/whatsapp/", data=payload, name=label)

    @task
    def web_ai_stress(self):
        import random
        
        common_symptoms = [
            "I have a fever and headache",
            "Severe chest pain",
            "I am coughing a lot",
            "Stomach pain after eating",
            "Dizziness and nausea",
            "My throat hurts",
            "I cut my finger, it is bleeding",
            "Back pain",
            "I feel anxious",
            "Blurry vision"
        ]
        
        if random.random() < 0.8:
            symptom = random.choice(common_symptoms)
            label = "/chatbot/stream/ (Common/Cached)"
        else:
            symptom = random.choice(common_symptoms) + f" details: {random.randint(1, 10000)}"
            label = "/chatbot/stream/ (Unique/AI)"
        
        payload = {
            "message": symptom,
            "location": {"latitude": 12.9716, "longitude": 77.5946},
            "session_id": f"loadtest_{self.environment.runner.user_count % 10}",
            "is_guest": True
        }
        
        # Web chatbot uses internal Stream
        with self.client.post("/chatbot/stream/", json=payload, name=label, catch_response=True, stream=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")

if __name__ == "__main__":
    import os
    import sys
    # Use 'locust' command relative to the python environment if possible, or just 'locust'
    os.system(f"locust -f {__file__}")

