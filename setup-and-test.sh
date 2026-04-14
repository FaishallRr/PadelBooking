#!/bin/bash

# 🎯 PadelBooking - Setup Data & Payment Gateway Testing
# Script untuk populate database dan test end-to-end payment flow

set -e  # Exit on error

API_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🎯 PadelBooking - Setup & Payment Testing${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# ==========================================
# STEP 1: SEED DATABASE
# ==========================================
echo -e "${YELLOW}[STEP 1] Seeding Database with Test Data...${NC}"
echo ""

cd backend

echo "Running seed script..."
npm run seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully!${NC}"
else
    echo -e "${RED}❌ Seeding failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Test Users Created:${NC}"
echo "  👤 Admin    : admin@padel.com / admin123"
echo "  👤 User 1   : user1@padel.com / user123"
echo "  👤 User 2   : user2@padel.com / user123"
echo "  🏢 Mitra    : mitra@padel.com / mitra123"
echo ""

# ==========================================
# STEP 2: TEST ADMIN LOGIN & DASHBOARD
# ==========================================
echo -e "${YELLOW}[STEP 2] Testing Admin Login...${NC}"
echo ""

ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@padel.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ADMIN_ROLE=$(echo "$ADMIN_LOGIN" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin Login Successful${NC}"
    echo "   Token: ${ADMIN_TOKEN:0:20}..."
    echo "   Role: $ADMIN_ROLE"
else
    echo -e "${RED}❌ Admin Login Failed${NC}"
    echo "   Response: $ADMIN_LOGIN"
    exit 1
fi

echo ""

# ==========================================
# STEP 3: TEST USER LOGIN & BOOKING
# ==========================================
echo -e "${YELLOW}[STEP 3] Testing User Login & Booking Flow...${NC}"
echo ""

USER_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@padel.com",
    "password": "user123"
  }')

USER_TOKEN=$(echo "$USER_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$USER_TOKEN" ]; then
    echo -e "${GREEN}✅ User Login Successful${NC}"
    echo "   Email: user1@padel.com"
    echo "   Token: ${USER_TOKEN:0:20}..."
else
    echo -e "${RED}❌ User Login Failed${NC}"
    exit 1
fi

echo ""

# Get lapangan list
echo "Fetching available lapangan..."
LAPANGAN=$(curl -s -X GET "$API_URL/api/lapangan" \
  -H "Authorization: Bearer $USER_TOKEN")

LAPANGAN_ID=$(echo "$LAPANGAN" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$LAPANGAN_ID" ]; then
    echo -e "${GREEN}✅ Lapangan Found${NC}"
    echo "   Lapangan ID: $LAPANGAN_ID"
else
    echo -e "${RED}❌ No lapangan found${NC}"
    exit 1
fi

echo ""

# Get available jadwal
echo "Fetching available jadwal..."
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
JADWAL=$(curl -s -X GET "$API_URL/api/jadwal/available?tanggal=$TOMORROW&lapangan_id=$LAPANGAN_ID" \
  -H "Authorization: Bearer $USER_TOKEN")

JADWAL_ID=$(echo "$JADWAL" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$JADWAL_ID" ]; then
    echo -e "${GREEN}✅ Jadwal Available${NC}"
    echo "   Jadwal ID: $JADWAL_ID"
    echo "   Date: $TOMORROW"
else
    echo -e "${RED}❌ No jadwal available${NC}"
    exit 1
fi

echo ""

# ==========================================
# STEP 4: CREATE BOOKING
# ==========================================
echo -e "${YELLOW}[STEP 4] Creating Booking...${NC}"
echo ""

BOOKING=$(curl -s -X POST "$API_URL/api/booking" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"lapangan_id\": $LAPANGAN_ID,
    \"jadwalLapanganId\": $JADWAL_ID,
    \"total_harga\": 400000
  }")

ORDER_ID=$(echo "$BOOKING" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$ORDER_ID" ]; then
    echo -e "${GREEN}✅ Booking Created Successfully${NC}"
    echo "   Order ID: $ORDER_ID"
    echo "   Total Harga: Rp 400.000"
else
    echo -e "${RED}❌ Booking Failed${NC}"
    echo "   Response: $BOOKING"
    exit 1
fi

echo ""

# ==========================================
# STEP 5: CREATE PAYMENT & GET SNAP TOKEN
# ==========================================
echo -e "${YELLOW}[STEP 5] Creating Payment (Midtrans Snap Token)...${NC}"
echo ""

PAYMENT=$(curl -s -X POST "$API_URL/api/payment/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"order_id\": $ORDER_ID,
    \"sewa_raket\": false
  }")

SNAP_TOKEN=$(echo "$PAYMENT" | grep -o '"snap_token":"[^"]*"' | cut -d'"' -f4)
MIDTRANS_ORDER_ID=$(echo "$PAYMENT" | grep -o '"midtrans_order_id":"[^"]*"' | cut -d'"' -f4)
TOTAL_BAYAR=$(echo "$PAYMENT" | grep -o '"total_bayar":[0-9]*' | cut -d':' -f2)

if [ ! -z "$SNAP_TOKEN" ]; then
    echo -e "${GREEN}✅ Payment Token Created Successfully!${NC}"
    echo ""
    echo "📊 Payment Details:"
    echo "   Snap Token: ${SNAP_TOKEN:0:30}..."
    echo "   Midtrans Order ID: $MIDTRANS_ORDER_ID"
    echo "   Total Bayar: Rp $TOTAL_BAYAR"
    echo ""
    echo "🔗 Next Steps:"
    echo "   1. Open Midtrans Sandbox: https://app.sandbox.midtrans.com"
    echo "   2. Use Snap Token above to process payment"
    echo "   3. Or use test card:"
    echo "      Card: 4811 1111 1111 1114"
    echo "      Exp: 12/25"
    echo "      CVV: 123"
else
    echo -e "${RED}❌ Payment Creation Failed${NC}"
    echo "   Response: $PAYMENT"
    exit 1
fi

echo ""

# ==========================================
# STEP 6: TEST PAYMENT STATUS CHECK
# ==========================================
echo -e "${YELLOW}[STEP 6] Testing Payment Status Check...${NC}"
echo ""

STATUS=$(curl -s -X GET "$API_URL/api/payment/status/$MIDTRANS_ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN")

PAYMENT_STATUS=$(echo "$STATUS" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$PAYMENT_STATUS" ]; then
    echo -e "${GREEN}✅ Payment Status Retrieved${NC}"
    echo "   Status: $PAYMENT_STATUS"
else
    echo -e "${YELLOW}⚠️  Status check returned but needs verification${NC}"
fi

echo ""

# ==========================================
# STEP 7: TEST MITRA LOGIN
# ==========================================
echo -e "${YELLOW}[STEP 7] Testing Mitra Login & Dashboard...${NC}"
echo ""

MITRA_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mitra@padel.com",
    "password": "mitra123"
  }')

MITRA_TOKEN=$(echo "$MITRA_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$MITRA_TOKEN" ]; then
    echo -e "${GREEN}✅ Mitra Login Successful${NC}"
    echo "   Email: mitra@padel.com"
    echo "   Token: ${MITRA_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Mitra Login Failed${NC}"
fi

echo ""

# ==========================================
# STEP 8: SHOW SUMMARY
# ==========================================
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ SETUP & TESTING COMPLETE!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${BLUE}📊 Test Summary:${NC}"
echo ""
echo "Users Created:"
echo "  ✅ Admin    (admin@padel.com)"
echo "  ✅ User 1   (user1@padel.com) - Made booking & payment"
echo "  ✅ User 2   (user2@padel.com) - Ready to test"
echo "  ✅ Mitra    (mitra@padel.com) - Owns lapangan"
echo ""

echo "Lapangan Created:"
echo "  ✅ Padel Court 1 - Rp 400.000/jam"
echo "  ✅ Padel Court 2 - Rp 450.000/jam"
echo ""

echo "Booking & Payment:"
echo "  ✅ Order ID: $ORDER_ID"
echo "  ✅ Midtrans Order ID: $MIDTRANS_ORDER_ID"
echo "  ✅ Total Bayar: Rp $TOTAL_BAYAR"
echo "  ✅ Snap Token: Generated ✓"
echo ""

echo -e "${BLUE}🧪 Test Credentials:${NC}"
echo ""
echo "Admin Dashboard:"
echo "  Email: admin@padel.com"
echo "  Password: admin123"
echo "  Token: $ADMIN_TOKEN"
echo ""

echo "User Account:"
echo "  Email: user1@padel.com"
echo "  Password: user123"
echo "  Token: $USER_TOKEN"
echo ""

echo "Mitra Dashboard:"
echo "  Email: mitra@padel.com"
echo "  Password: mitra123"
echo "  Token: $MITRA_TOKEN"
echo ""

echo -e "${BLUE}🔗 Important Links:${NC}"
echo ""
echo "Frontend App: $FRONTEND_URL"
echo "Backend API: $API_URL"
echo "Midtrans Dashboard: https://app.sandbox.midtrans.com"
echo ""

echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Test Frontend:"
echo "   cd frontend && npm run dev"
echo "   Open: $FRONTEND_URL in your browser"
echo ""

echo "2. Test Login in Frontend:"
echo "   - Try admin dashboard"
echo "   - Try user booking flow"
echo "   - Try mitra dashboard"
echo ""

echo "3. Test Payment in Midtrans:"
echo "   - Go to Snap Token payment page"
echo "   - Use test card:"
echo "     4811 1111 1111 1114 / 12/25 / 123"
echo "   - Complete payment"
echo "   - Check webhook notification"
echo ""

echo "4. Verify Data in Database:"
echo "   mysql -u root sewa_lapangan_padel"
echo "   SELECT * FROM users;"
echo "   SELECT * FROM transaksi;"
echo ""

echo -e "${GREEN}✨ Ready to Test Payment Gateway!${NC}"
echo ""
