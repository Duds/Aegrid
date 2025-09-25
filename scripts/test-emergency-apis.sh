#!/bin/bash

# Emergency API Quick Test Script
# Tests emergency APIs with authentication

set -e

BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_USER_EMAIL:-test@greenfieldshire.council}"
TEST_PASSWORD="${TEST_USER_PASSWORD:-testpassword123}"

echo "🚨 Emergency API Quick Test"
echo "Base URL: $BASE_URL"
echo "Test User: $TEST_EMAIL"
echo ""

# Function to make authenticated request
make_request() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="$3"

    echo -n "Testing $method $endpoint... "

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -c cookies.txt \
            -b cookies.txt \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -c cookies.txt \
            -b cookies.txt \
            "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" -eq 200 ]; then
        echo "✅ ($http_code)"
    else
        echo "❌ ($http_code)"
        echo "Response: $body"
    fi
}

# Clean up cookies file
rm -f cookies.txt

echo "🔐 Authenticating..."
auth_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c cookies.txt \
    "$BASE_URL/api/auth/signin")

auth_code=$(echo "$auth_response" | tail -n1)

if [ "$auth_code" -eq 200 ]; then
    echo "✅ Authentication successful"
else
    echo "❌ Authentication failed ($auth_code)"
    echo "Response: $(echo "$auth_response" | head -n -1)"
    exit 1
fi

echo ""
echo "🧪 Running API Tests..."

# Test Control Center Emergency API
echo "🏢 Control Center Emergency API:"
make_request "/api/control-center/emergency"

# Test Simulation Emergency API
echo "🎯 Simulation Emergency API:"
make_request "/api/simulation/emergency?format=json"
make_request "/api/simulation/emergency?format=cap"
make_request "/api/simulation/emergency?format=eas"

# Test External Emergency API
echo "🌐 External Emergency API:"
make_request "/api/external/emergency?external=true&format=json"
make_request "/api/external/emergency?external=true&format=xml"
make_request "/api/external/emergency?external=true&format=csv"

# Test POST endpoints
echo ""
echo "📝 Testing POST Endpoints..."

echo "🏢 Creating emergency alert..."
make_request "/api/control-center/emergency" "POST" '{
    "alertType": "EQUIPMENT_FAILURE",
    "severity": "HIGH",
    "title": "Test Emergency Alert",
    "description": "Test emergency alert created by script",
    "location": "Test Location"
}'

echo "🌐 Reporting external emergency..."
make_request "/api/external/emergency?external=true" "POST" '{
    "action": "report_emergency",
    "data": {
        "type": "EQUIPMENT_FAILURE",
        "severity": "HIGH",
        "location": "Test External Location",
        "description": "Test emergency reported via external API"
    }
}'

# Clean up
rm -f cookies.txt

echo ""
echo "✅ All tests completed!"
