# 💳 PadelBooking Payment Gateway Integration Testing

**Status**: ✅ Midtrans Sandbox Configured  
**Server Key**: Mid-server-*** (Check .env)  
**Client Key**: Mid-client-*** (Check .env)  
**Mode**: Sandbox (Testing)

---

## 🚀 QUICKSTART TESTING

### Prerequisites

```bash
# 1. Ensure backend running
cd backend && npm start

# 2. In another terminal, seed database
npm run seed

# 3. Run automated setup & testing
bash setup-and-test.sh
```

---

## 📋 MANUAL PAYMENT FLOW TESTING

### 1️⃣ LOGIN (Get User Token)

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@padel.com",
    "password": "user123"
  }'

# Expected Response:
{
  "message": "Login berhasil",
  "role": "user",
  "token": "eyJhbGc...",
  "user_id": 1,
  "isMitraCompleted": false
}
```

**Save the token** - you'll need it for all API calls

---

### 2️⃣ GET AVAILABLE LAPANGAN

```bash
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)

curl -X GET http://localhost:5000/api/lapangan \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
[
  {
    "id": 1,
    "nama": "Padel Court 1",
    "slug": "padel-court-1",
    "harga": 400000,
    "rating": 4.5,
    "status": "tersedia"
  }
]
```

**Save lapangan_id** (should be 1)

---

### 3️⃣ GET AVAILABLE JADWAL (Slots)

```bash
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)

curl -X GET "http://localhost:5000/api/jadwal/available?tanggal=$TOMORROW&lapangan_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
[
  {
    "id": 1,
    "lapangan_id": 1,
    "tanggal": "2026-04-15T00:00:00.000Z",
    "slot": "09:00-10:00",
    "status": "tersedia"
  }
]
```

**Save jadwal_id** (should be 1)

---

### 4️⃣ CREATE BOOKING (Reserve Slot)

```bash
curl -X POST http://localhost:5000/api/booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "lapangan_id": 1,
    "jadwalLapanganId": 1,
    "total_harga": 400000
  }'

# Expected Response:
{
  "message": "Booking berhasil",
  "data": {
    "order": {
      "id": 1,
      "user_id": 1,
      "lapangan_id": 1,
      "jadwalLapanganId": 1,
      "status": "pending",
      "total_harga": 400000
    }
  }
}
```

**Save order_id** (should be 1)

---

### 5️⃣ CREATE PAYMENT (Generate Snap Token) ⭐ CRITICAL

```bash
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_id": 1,
    "sewa_raket": false
  }'

# Expected Response:
{
  "message": "Snap token berhasil dibuat",
  "snap_token": "6e1b25c8-b259-4e3f-a3c7-2cf....",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v4/...",
  "midtrans_order_id": "PADEL-1-1713081234567",
  "total_bayar": 420000,
  "biaya_admin": 20000
}
```

**This is CRITICAL** - if this fails, payment gateway won't work

---

### 6️⃣ OPEN PAYMENT PAGE

```
Open in browser:
https://app.sandbox.midtrans.com/snap/v4/{snap_token}

Or use curl to test:
curl -X GET "https://api.sandbox.midtrans.com/v2/{midtrans_order_id}/status" \
  -u "YOUR_SERVER_KEY:"
```

---

### 7️⃣ TEST PAYMENT (Sandbox)

**Use Test Card:**

- Card Number: `4811 1111 1111 1114`
- Exp: `12/25`
- CVV: `123`
- OTP: Any 6 digits (e.g., 123456)

**Or Use BCA Virtual Account:**

- Virtual Account will be generated automatically
- Just send the amount shown

**Or Use GCash (Philippines):**

- Test number provided in Snap

---

### 8️⃣ CHECK PAYMENT STATUS

```bash
curl -X GET http://localhost:5000/api/payment/status/PADEL-1-1713081234567 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response When Payment Success:
{
  "transaksi": {
    "id": 1,
    "status": "berhasil",
    "total_harga": 420000,
    "biaya_admin": 20000,
    "payment_type": "credit_card",
    "midtrans_order_id": "PADEL-1-1713081234567"
  },
  "order": {
    "id": 1,
    "status": "dibayar",
    "tanggal": "2026-04-15T00:00:00.000Z",
    "jam_mulai": "09:00",
    "jam_selesai": "10:00"
  },
  "midtrans": {
    "transaction_status": "settlement",
    "payment_type": "credit_card",
    "fraud_status": "accept"
  }
}
```

---

## ✅ PAYMENT FLOW VERIFICATION CHECKLIST

### Backend Checks

| Check                | Expected                  | Status |
| -------------------- | ------------------------- | ------ |
| Login returns JWT    | ✓ Token generated         | [ ]    |
| Get lapangan         | ✓ List retrieved          | [ ]    |
| Get jadwal           | ✓ Slots shown             | [ ]    |
| Create booking       | ✓ Order ID returned       | [ ]    |
| **Create payment**   | ✓ Snap Token generated ⭐ | [ ]    |
| Check payment status | ✓ Status shows "berhasil" | [ ]    |

### Midtrans Checks

| Check             | Expected                | Status |
| ----------------- | ----------------------- | ------ |
| Snap Token valid  | ✓ Can open payment page | [ ]    |
| Payment success   | ✓ Transaction settled   | [ ]    |
| Webhook received  | ✓ Status updated in DB  | [ ]    |
| Order marked paid | ✓ Status = "dibayar"    | [ ]    |

### Database Checks

```bash
# Check transaksi status
mysql -u root sewa_lapangan_padel << EOF
SELECT id, status_pembayaran, total_harga
FROM transaksi
WHERE id = 1;
EOF

# Expected output:
# | id | status_pembayaran | total_harga |
# |  1 | berhasil          |      420000 |

# Check order booking status
SELECT id, status
FROM order_booking
WHERE id = 1;

# Expected output:
# | id | status |
# |  1 | dibayar|
```

---

## 🚨 COMMON ISSUES & DEBUG

### Issue 1: Snap Token Not Generated

**Error**: POST /api/payment/create returns 500

**Debug:**

```bash
# 1. Check Midtrans credentials
echo "Server Key: $(grep MIDTRANS_SERVER_KEY backend/.env)"
echo "Client Key: $(grep MIDTRANS_CLIENT_KEY backend/.env)"

# 2. Check backend logs
tail -f /var/log/backend.log | grep -i midtrans

# 3. Test Midtrans connection
curl -X GET https://app.sandbox.midtrans.com/api/server_key \
  -u "YOUR_SERVER_KEY_FROM_ENV:"

# 4. Check if order exists
mysql -u root sewa_lapangan_padel -e \
  "SELECT id, status FROM order_booking WHERE id = 1;"
```

### Issue 2: Payment Not Going Through

**Problem**: Snap Token shows but payment fails

**Debug:**

```bash
# 1. Check if sandbox mode correct
echo "MIDTRANS_IS_PRODUCTION: $(grep MIDTRANS_IS_PRODUCTION backend/.env)"
# Should be: MIDTRANS_IS_PRODUCTION=false

# 2. Use correct test card
# Card: 4811 1111 1111 1114
# Exp: 12/25 (must be in future!)
# CVV: 123

# 3. Check Midtrans dashboard
# Go: https://app.sandbox.midtrans.com
# Look for your transaction in Dashboard → Transactions

# 4. Check webhook logs in Midtrans
# Dashboard → Settings → Configuration → Webhook test logs
```

### Issue 3: Payment Successful but Order Not Updated

**Problem**: Midtrans shows "settlement" but database still "pending"

**Debug:**

```bash
# 1. Check webhook endpoint
# Midtrans Dashboard → Settings → Configuration → Webhook URL
# Should be: https://your-domain.com/api/payment/notification

# 2. Check if webhook was received
tail -f backend.log | grep "Midtrans Notification"

# 3. Manually verify transaksi
mysql -u root sewa_lapangan_padel -e \
  "SELECT id, status_pembayaran, payment_type
   FROM transaksi
   WHERE midtrans_order_id = 'PADEL-1-xxx';"

# 4. If webhook not received, manually update for testing
mysql -u root sewa_lapangan_padel -e \
  "UPDATE transaksi
   SET status_pembayaran = 'berhasil', payment_type = 'credit_card'
   WHERE id = 1;"
```

---

## 📊 EXPECTED DATABASE STATE AFTER PAYMENT

### transaksi table

```
| id | user_id | order_id | status_pembayaran | payment_type | total_harga |
|  1 |       1 |        1 | berhasil          | credit_card  |      420000 |
```

### order_booking table

```
| id | user_id | lapangan_id | status | total_harga |
|  1 |       1 |           1 | dibayar|      420000 |
```

### pendapatan_mitra table

```
| id | mitra_id | transaksi_id | jumlah  |
|  1 |        1 |            1 | 400000  |
```

### wallet_history table

```
| id | wallet_id | jumlah   | tipe    |
|  1 |         1 | -420000  | booking |
```

### notifikasi table

```
| id | user_id | pesan                                  | dibaca |
|  1 |       1 | Pembayaran berhasil! Booking... yang...|  false |
```

---

## 🔧 ADVANCED: WEBHOOK TESTING

### Manual Webhook Test

```bash
# Simulate Midtrans webhook notification
curl -X POST http://localhost:5000/api/payment/notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "PADEL-1-1713081234567",
    "transaction_status": "settlement",
    "payment_type": "credit_card",
    "fraud_status": "accept"
  }'

# Expected Response:
# { "message": "OK" }

# Check if transaksi updated
mysql -u root sewa_lapangan_padel -e \
  "SELECT status_pembayaran FROM transaksi \
   WHERE midtrans_order_id = 'PADEL-1-1713081234567';"
```

### Test Different Payment Status

```bash
# Test pending status
curl -X POST http://localhost:5000/api/payment/notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "PADEL-1-1713081234567",
    "transaction_status": "pending",
    "payment_type": "bank_transfer"
  }'

# Test failed/expired
curl -X POST http://localhost:5000/api/payment/notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "PADEL-1-1713081234567",
    "transaction_status": "expire",
    "payment_type": "credit_card"
  }'
```

---

## 💾 REFUND TESTING

### Test Refund API

```bash
curl -X POST http://localhost:5000/api/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "alasan": "User requested cancellation"
  }'

# Expected Response:
{
  "message": "Refund request submitted",
  "refund_id": "REF-1-1713081234567",
  "status": "pending",
  "amount": 420000
}

# Check refund status
mysql -u root sewa_lapangan_padel -e \
  "SELECT id, status, jumlah_refund \
   FROM refund \
   WHERE id = 1;"
```

---

## 📱 FRONTEND PAYMENT TESTING

### Test in Frontend App

```bash
# 1. Start frontend
cd frontend && npm run dev

# 2. Open http://localhost:3000

# 3. Login as user1@padel.com / user123

# 4. Navigate to:
#    - Browse Lapangan
#    - Select a slot
#    - Click "Pesan Sekarang"
#    - Click "Bayar Sekarang"
#    - Snap payment modal opens

# 5. Complete payment with test card

# 6. Verify:
#    - Redirected to success page
#    - Order status shows "Dibayar"
#    - Notification received
```

---

## 🎯 EXPECTED RESULTS SUMMARY

### ✅ Success Scenario

```
1. Login ✓
2. Browse Lapangan ✓
3. Select Slot & Create Booking ✓
4. Create Payment → Snap Token Generated ✓
5. Pay with Test Card ✓
6. Midtrans returns settlement ✓
7. Webhook received ✓
8. Database updated (transaksi status = "berhasil") ✓
9. Order marked "dibayar" ✓
10. User notification sent ✓
11. Mitra gets notification ✓
```

### Status Codes

- **Order Created**: status = "pending"
- **Payment Success**: status = "dibayar"
- **Payment Failed**: status = "expired"
- **Refund Initiated**: status = "pending_refund"
- **Refund Complete**: status = "refunded"

---

## 📞 SUPPORT

If payment gateway integration fails:

1. Check MIDTRANS credentials in .env
2. Verify MIDTRANS_IS_PRODUCTION=false (for sandbox)
3. Check Midtrans dashboard for failed transactions
4. Review backend logs for SMTP/database errors
5. Test with curl manually (instructions above)
6. Check webhook delivery in Midtrans dashboard

---

**Ready to Process Real Payments!** 💳✨

When ready for production:

1. Get production Midtrans keys
2. Set MIDTRANS_IS_PRODUCTION=true
3. Test with real payment methods
4. Deploy to production server
5. Monitor webhook notifications
