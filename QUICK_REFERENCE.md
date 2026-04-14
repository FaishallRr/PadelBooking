# ⚡ QUICK REFERENCE - Payment Gateway Testing

## 🚀 START TESTING IN 1 MINUTE

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Run Setup
bash setup-and-test.sh
```

**Done!** You'll get:

- ✅ Database seeded with test data
- ✅ User tokens
- ✅ Snap token for payment testing
- ✅ Order ID for tracking

---

## 👤 TEST ACCOUNTS

| Username | Email           | Password | Role  |
| -------- | --------------- | -------- | ----- |
| admin    | admin@padel.com | admin123 | Admin |
| user1    | user1@padel.com | user123  | User  |
| user2    | user2@padel.com | user123  | User  |
| mitra    | mitra@padel.com | mitra123 | Mitra |

---

## 💳 TEST PAYMENT CARDS

| Type        | Number              | Exp   | CVV | Status     |
| ----------- | ------------------- | ----- | --- | ---------- |
| Credit Card | 4811 1111 1111 1114 | 12/25 | 123 | ✅ Success |
| Visa Debit  | 4000 0000 0000 0002 | 12/25 | 123 | ❌ Fraud   |
| BCA VA      | Auto generated      | -     | -   | ✅ Success |

---

## 🔄 COMPLETE FLOW (API Calls)

### 1. Login

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@padel.com",
    "password": "user123"
  }' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### 2. Get Lapangan

```bash
LAPANGAN_ID=$(curl -s http://localhost:5000/api/lapangan \
  -H "Authorization: Bearer $TOKEN" | \
  grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "Lapangan ID: $LAPANGAN_ID"
```

### 3. Get Jadwal

```bash
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
JADWAL_ID=$(curl -s "http://localhost:5000/api/jadwal/available?tanggal=$TOMORROW&lapangan_id=$LAPANGAN_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "Jadwal ID: $JADWAL_ID"
```

### 4. Create Booking

```bash
ORDER_ID=$(curl -s -X POST http://localhost:5000/api/booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"lapangan_id\": $LAPANGAN_ID,
    \"jadwalLapanganId\": $JADWAL_ID,
    \"total_harga\": 400000
  }" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "Order ID: $ORDER_ID"
```

### 5. Create Payment ⭐

```bash
curl -s -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"order_id\": $ORDER_ID,
    \"sewa_raket\": false
  }" | jq .
```

**Expected Response:**

```json
{
  "snap_token": "...",
  "midtrans_order_id": "PADEL-X-XXX",
  "total_bayar": 420000
}
```

### 6. Check Payment Status

```bash
curl -s http://localhost:5000/api/payment/status/PADEL-X-XXX \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 🧪 MINIMAL TEST (15 seconds)

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@padel.com","password":"user123"}' \
  | jq -r '.token')

# Create booking & payment
RESPONSE=$(curl -s -X POST http://localhost:5000/api/booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lapangan_id":1,"jadwalLapanganId":1,"total_harga":400000}')

ORDER_ID=$(echo $RESPONSE | jq -r '.data.order.id')

# Get Snap Token
curl -s -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"order_id\":$ORDER_ID,\"sewa_raket\":false}" \
  | jq -r '.snap_token'
```

---

## 🔗 IMPORTANT URLs

| Resource            | URL                                         |
| ------------------- | ------------------------------------------- |
| Frontend            | http://localhost:3000                       |
| Backend             | http://localhost:5000                       |
| Midtrans Dashboard  | https://app.sandbox.midtrans.com            |
| Test Card Generator | https://simulator.midtrans.com              |
| API Docs            | http://localhost:5000/docs _(if available)_ |

---

## ✅ VERIFY SUCCESS

### Backend Response Code

```
✅ 200, 201 = Success
❌ 400 = Bad request
❌ 401 = Unauthorized
❌ 500 = Server error
```

### Database Verification

```bash
# Check transaksi
mysql -u root sewa_lapangan_padel -e \
  "SELECT status_pembayaran FROM transaksi WHERE id=1;"

# Check order
mysql -u root sewa_lapangan_padel -e \
  "SELECT status FROM order_booking WHERE id=1;"
```

### Midtrans Verification

```
Go: https://app.sandbox.midtrans.com
Look for your transaction in:
  Dashboard → Transactions → Find by Order ID
```

---

## 🐛 QUICK DEBUG

| Issue         | Command                                                        |
| ------------- | -------------------------------------------------------------- |
| Token invalid | `curl http://localhost:5000/ -H "Authorization: Bearer TOKEN"` |
| No lapangan   | `mysql ... -e "SELECT COUNT(*) FROM lapangan;"`                |
| No payment    | `grep MIDTRANS_SERVER_KEY backend/.env`                        |
| Webhook fail  | Check Midtrans Dashboard → Settings → Webhook logs             |

---

## 📋 THINGS TO REMEMBER

- ✅ Use **Bearer token** for all API calls (except /auth/login)
- ✅ Use `Content-Type: application/json`
- ✅ Snap token is 1-time use
- ✅ Test card expires 12/25 (must be in future!)
- ✅ Order ID must exist before payment
- ✅ Booking must be "pending" before payment
- ❌ Don't use production Midtrans keys in localhost
- ❌ Don't commit .env file to git

---

## 🚀 NEXT: PRODUCTION

```bash
# Get production keys:
# 1. Go: https://dashboard.midtrans.com
# 2. Login with production account
# 3. Copy Server Key & Client Key
# 4. Update backend/.env:
#    MIDTRANS_IS_PRODUCTION=true
#    MIDTRANS_SERVER_KEY="Mid-server-..."
#    MIDTRANS_CLIENT_KEY="Mid-client-..."

# Deploy & test!
```

---

**Status**: ✅ Ready to test  
**Midtrans Credentials**: ✅ Configured  
**Test Data**: ✅ Seeded  
**Payment Flow**: ✅ Complete

Go test it now! 🎉
