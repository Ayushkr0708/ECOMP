import urllib.request
import urllib.parse

# Create test CSV file
test_data = """customer_id,age,annual_income,spending_score,purchase_frequency,avg_order_value,last_purchase_days
CUST_001,25,35000,45,8,85,45
CUST_002,34,52000,72,15,120,20"""

with open('test.csv', 'w') as f:
    f.write(test_data)

# Upload using multipart form data
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.csv"\r\nContent-Type: text/csv\r\n\r\n'

with open('test.csv', 'rb') as f:
    file_content = f.read()

body = body.encode() + file_content + f'\r\n--{boundary}--\r\n'.encode()

req = urllib.request.Request(
    'http://localhost:5000/api/data/upload',
    data=body,
    headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Accept': 'application/json'
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode()[:500]}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode()[:500]}")
except Exception as e:
    print(f"Error: {e}")