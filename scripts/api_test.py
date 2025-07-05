import requests
import time

TOKEN = "placeholder"
PORT = "8080"
BASE_URL = f"http://localhost:{PORT}"

endpoints = [
    ("/api/top-tracks", {"amount": "10", "timeRange": "long_term"}),
    ("/api/top-artists", {"amount": "10", "timeRange": "long_term"}),
    ("/api/top-genres", {"amount": "10", "timeRange": "long_term"}),
    ("/api/user", {}),
]

headers = {"Authorization": f"Bearer {TOKEN}"}

def check_endpoint(endpoint, params):
    url = f"{BASE_URL}{endpoint}"
    try:
        start = time.time()
        r = requests.get(url, headers=headers, params=params)
        elapsed = time.time() - start
        passed = r.status_code == 200 and r.json()
        indicator = "✅" if passed else "❌"
        print(f"{indicator} {endpoint.ljust(20)} {str(r.status_code).ljust(10)} {elapsed:.2f}s")
    except Exception as e:
        print(f"❌ {endpoint.ljust(20)} ERROR {str(e)}")

print("API Test Results:")
print("-" * 40)
for endpoint, params in endpoints:
    check_endpoint(endpoint, params)
