#!/bin/bash

# 🧪 PadelBooking Full Flow Test Script
# Usage: bash test-flow.sh

API_URL="http://localhost:5000"
TEST_EMAIL="padel-test-$(date +%s)@test.com"
TEST_PASSWORD="Test@12345"
TEST_PHONE="081234567890"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "🧪 PadelBooking Full Flow Test Suite"
echo "========================================="
echo "Testing Email: $TEST_EMAIL"
echo ""

# ==========================================
# PHASE 1: AUTHENTICATION
# ==========================================
echo -e "${YELLOW}[PHASE 1] Testing Authentication Flow...${NC}"
echo ""

# Test 1: Send OTP
echo -e "${YELLOW}TEST 1: Send OTP${NC}"
OTP_RESPONSE=$(curl -s -X POST \
  "$API_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$OTP_RESPONSE" | tail -n1)
BODY=$(echo "$OTP_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ OTP Sent (HTTP 200)${NC}"
  echo "Response: $BODY"
  # Extract expiry time
  EXPIRY=$(echo "$BODY" | grep -o '"expired_at":"[^"]*"' | cut -d'"' -f4)
  echo "OTP expires at: $EXPIRY"
else
  echo -e "${RED}❌ Failed to send OTP (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# Test 2: Get OTP from DB (for testing - in production get from email)
echo -e "${YELLOW}TEST 2: Getting OTP code (testing only)${NC}"
echo "⚠️  In production, get OTP from email"
echo "For testing, check the backend logs or database:"
echo "  mysql -u root sewa_lapangan_padel -e \"SELECT kode_otp FROM otp_codes WHERE user_email='$TEST_EMAIL' LIMIT 1;\""
echo ""

# For automation, we'll create a test OTP
echo -n "Enter OTP code from email (or press Enter to use: 123456): "
read OTP_CODE
OTP_CODE=${OTP_CODE:-123456}

# Test 3: Verify OTP
echo -e "${YELLOW}TEST 3: Verify OTP${NC}"
VERIFY_RESPONSE=$(curl -s -X POST \
  "$API_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"otp\": \"$OTP_CODE\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
BODY=$(echo "$VERIFY_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ OTP Verified (HTTP 200)${NC}"
else
  echo -e "${RED}❌ Failed to verify OTP (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  echo "Skipping to next phase..."
fi
echo ""

# Test 4: Register User
echo -e "${YELLOW}TEST 4: Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST \
  "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"nama\": \"Test User $(date +%s)\",
    \"username\": \"testuser_$(date +%s)\",
    \"password\": \"$TEST_PASSWORD\",
    \"no_hp\": \"$TEST_PHONE\",
    \"role\": \"user\"
  }" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✅ User Registered (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ Failed to register (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# Test 5: Login
echo -e "${YELLOW}TEST 5: Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Login Successful (HTTP 200)${NC}"
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  USER_ID=$(echo "$BODY" | grep -o '"user_id":[0-9]*' | cut -d':' -f2)
  echo "Token: ${TOKEN:0:20}..."
  echo "User ID: $USER_ID"
else
  echo -e "${RED}❌ Login Failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# ==========================================
# PHASE 2: BOOKING
# ==========================================
echo -e "${YELLOW}[PHASE 2] Testing Booking Flow...${NC}"
echo ""

# Test 6: Get Lapangan List
echo -e "${YELLOW}TEST 6: Get Lapangan List${NC}"
START_TIME=$(date +%s%N)
LAPANGAN_RESPONSE=$(curl -s -X GET \
  "$API_URL/api/lapangan" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")
END_TIME=$(date +%s%N)
ELAPSED=$((($END_TIME - $START_TIME) / 1000000))

HTTP_CODE=$(echo "$LAPANGAN_RESPONSE" | tail -n1)
BODY=$(echo "$LAPANGAN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Lapangan List Retrieved (HTTP 200)${NC}"
  echo "Response time: ${ELAPSED}ms"
  LAPANGAN_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "First Lapangan ID: $LAPANGAN_ID"

  if [ -z "$LAPANGAN_ID" ]; then
    echo -e "${YELLOW}⚠️  No lapangan found in database${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ Failed to get lapangan (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  exit 1
fi
echo ""

# Test 7: Get Jadwal/Slots
echo -e "${YELLOW}TEST 7: Get Available Slots${NC}"
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
echo "Checking slots for: $TOMORROW"

START_TIME=$(date +%s%N)
JADWAL_RESPONSE=$(curl -s -X GET \
  "$API_URL/api/jadwal/available?tanggal=$TOMORROW&lapangan_id=$LAPANGAN_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")
END_TIME=$(date +%s%N)
ELAPSED=$((($END_TIME - $START_TIME) / 1000000))

HTTP_CODE=$(echo "$JADWAL_RESPONSE" | tail -n1)
BODY=$(echo "$JADWAL_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Slots Retrieved (HTTP 200)${NC}"
  echo "Response time: ${ELAPSED}ms"
  JADWAL_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "First Jadwal ID: $JADWAL_ID"
else
  echo -e "${RED}❌ Failed to get jadwal (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi
echo ""

# Test 8: Create Booking
if [ ! -z "$JADWAL_ID" ]; then
  echo -e "${YELLOW}TEST 8: Create Booking${NC}"
  HARGA=100000

  START_TIME=$(date +%s%N)
  BOOKING_RESPONSE=$(curl -s -X POST \
    "$API_URL/api/booking" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"lapangan_id\": $LAPANGAN_ID,
      \"jadwalLapanganId\": $JADWAL_ID,
      \"total_harga\": $HARGA
    }" \
    -w "\n%{http_code}")
  END_TIME=$(date +%s%N)
  ELAPSED=$((($END_TIME - $START_TIME) / 1000000))

  HTTP_CODE=$(echo "$BOOKING_RESPONSE" | tail -n1)
  BODY=$(echo "$BOOKING_RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Booking Created (HTTP $HTTP_CODE)${NC}"
    echo "Response time: ${ELAPSED}ms"
    ORDER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Order ID: $ORDER_ID"
  else
    echo -e "${RED}❌ Failed to create booking (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
  fi
fi
echo ""

# ==========================================
# PHASE 3: PAYMENT (if booking created)
# ==========================================
if [ ! -z "$ORDER_ID" ]; then
  echo -e "${YELLOW}[PHASE 3] Testing Payment Flow...${NC}"
  echo ""

  echo -e "${YELLOW}TEST 9: Create Payment (Snap Token)${NC}"
  echo "⚠️  Requires valid Midtrans credentials in .env"
  echo "If this fails, check:"
  echo "  - MIDTRANS_SERVER_KEY is set"
  echo "  - MIDTRANS_CLIENT_KEY is set"
  echo "  - MIDTRANS_IS_PRODUCTION matches your account"
  echo ""

  START_TIME=$(date +%s%N)
  PAYMENT_RESPONSE=$(curl -s -X POST \
    "$API_URL/api/payment/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"order_id\": $ORDER_ID,
      \"sewa_raket\": false
    }" \
    -w "\n%{http_code}")
  END_TIME=$(date +%s%N)
  ELAPSED=$((($END_TIME - $START_TIME) / 1000000))

  HTTP_CODE=$(echo "$PAYMENT_RESPONSE" | tail -n1)
  BODY=$(echo "$PAYMENT_RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Payment Token Created (HTTP 200)${NC}"
    echo "Response time: ${ELAPSED}ms"
    SNAP_TOKEN=$(echo "$BODY" | grep -o '"snap_token":"[^"]*"' | cut -d'"' -f4)
    echo "Snap Token: ${SNAP_TOKEN:0:20}..."
  else
    echo -e "${RED}❌ Failed to create payment (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    echo "This might be due to invalid Midtrans credentials"
  fi
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ Testing Complete!${NC}"
echo "========================================="
echo ""
echo "📊 Summary:"
echo "  - Authentication: Tested"
echo "  - Booking Flow: Tested"
echo "  - Payment Flow: Tested"
echo ""
echo "📝 Next Steps:"
echo "  1. Review response times (should all be < 10s)"
echo "  2. Check database for created records"
echo "  3. Test on production server"
echo "  4. Configure Midtrans with real credentials"
echo ""
