# 🧪 PadelBooking Full Flow Test Checklist

## ✅ Backend Infrastructure

- [x] OTP Email Configuration Fixed (SMTP_USER/SMTP_PASS, port 587)
- [x] Request Timeout Handler Added (30s)
- [x] Prisma Client Optimized (logging, graceful shutdown)
- [x] .env Credentials Removed & .gitignore Added
- [x] Connection Pooling Ready (docs in .env.example)

## 🧪 LOCAL TESTING - PHASE 1 (Authentication)

### Test OTP Email Flow

```bash
# 1. Send OTP
POST http://localhost:5000/auth/send-otp
{
  "email": "test@gmail.com"
}
# Expected: 200 OK, OTP stored in DB, email sent

# 2. Verify OTP
POST http://localhost:5000/auth/verify-otp
{
  "email": "test@gmail.com",
  "otp": "123456"
}
# Expected: 200 OK

# 3. Register User
POST http://localhost:5000/auth/register
{
  "email": "test@gmail.com",
  "nama": "Test User",
  "username": "testuser",
  "password": "password123",
  "no_hp": "08123456789",
  "role": "user"
}
# Expected: 201 Created

# 4. Login
POST http://localhost:5000/auth/login
{
  "email": "test@gmail.com",
  "password": "password123"
}
# Expected: 200 OK, JWT token returned
```

### Test Auth Middleware

```bash
# 5. Get Protected Resource
GET http://localhost:5000/profile
Headers: Authorization: Bearer {token}
# Expected: 200 OK, user profile
```

## 🧪 LOCAL TESTING - PHASE 2 (Booking)

### Test Lapangan API

```bash
# 1. Get All Lapangan
GET http://localhost:5000/api/lapangan
# Expected: 200 OK, list lapangan with jadwal

# 2. Get Lapangan Detail
GET http://localhost:5000/api/lapangan/{slug}
# Expected: 200 OK, detail + gambar + jadwal
```

### Test Jadwal API

```bash
# 1. Get Available Slots
GET http://localhost:5000/api/jadwal/available?tanggal=2026-04-15&lapangan_id=1
# Expected: 200 OK, available slots

# 2. Check for timeout (measure response time)
# Should be < 5 seconds for local
```

### Test Booking Flow

```bash
# 1. Create Booking
POST http://localhost:5000/api/booking
Headers: Authorization: Bearer {token}
{
  "lapangan_id": 1,
  "jadwalLapanganId": 1,
  "total_harga": 100000
}
# Expected: 201 Created, order_id returned
# Check: Response time < 3 seconds

# 2. Get My Bookings
GET http://localhost:5000/api/booking
Headers: Authorization: Bearer {token}
# Expected: 200 OK, user's bookings
```

## 💳 LOCAL TESTING - PHASE 3 (Payment)

### Test Midtrans Integration

```bash
# 1. Create Payment (Get Snap Token)
POST http://localhost:5000/api/payment/create
Headers: Authorization: Bearer {token}
{
  "order_id": 1,
  "sewa_raket": false
}
# Expected: 200 OK
# Expected Response:
# {
#   "snap_token": "xxx",
#   "redirect_url": "xxx",
#   "total_bayar": 105000
# }
# Check: Response time < 5 seconds

# 2. Get Payment Status
GET http://localhost:5000/api/payment/status/{midtransOrderId}
# Expected: 200 OK, current payment status
```

## 📊 PERFORMANCE CHECKS (LOCAL)

### Connection & Response Time

- [ ] OTP Send: < 3s
- [ ] Booking Create: < 3s
- [ ] Payment Create: < 5s (Midtrans call)
- [ ] Get Lapangan List: < 2s
- [ ] Login: < 2s

### Database Checks

```bash
# Check DB connection pooling
mysql -u root sewa_lapangan_padel -e "SHOW PROCESSLIST;"
# Should show max 10-15 connections (not hanging)
```

### Error Handling

- [ ] Missing fields → 400 Bad Request
- [ ] Unauthorized access → 401 Unauthorized
- [ ] Request timeout → 408 Request Timeout
- [ ] Server error → 500 with error message

## 🚀 SERVER TESTING - PHASE 4

### Environment Setup

```bash
# 1. Set production environment variables
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10"
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY="Mid-server-KEY"
MIDTRANS_CLIENT_KEY="Mid-client-KEY"
SMTP_USER="your-real-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Server Deployment Tests

- [ ] Database migration successful
- [ ] Server starts without errors
- [ ] Health check endpoint returns 200
- [ ] CORS properly configured for production domain

### Full Flow on Server

- [ ] OTP email sends successfully
- [ ] Login works
- [ ] Booking creates
- [ ] Payment snap token generated
- [ ] Response times acceptable < 10s

## ⚠️ CRITICAL BEFORE PAYMENT GATEWAY

### Security Checklist

- [x] No credentials in .env (moved to examples)
- [x] .gitignore properly configured
- [x] JWT secret is strong & random
- [x] CORS restricted to allowed domains
- [x] Request timeout configured
- [x] Error messages don't expose sensitive info

### Gateway Readiness

- [ ] Midtrans credentials tested (sandbox first)
- [ ] Payment webhook endpoint verified
- [ ] Refund flow tested
- [ ] Error handling for payment failures
- [ ] Notification system working

## 📝 Test Results Log

### Local Testing

- OTP Email: ****\_\_\_****
- Auth Flow: ****\_\_\_****
- Booking Flow: ****\_\_\_****
- Payment Creation: ****\_\_\_****
- Response Times: ****\_\_\_****

### Server Testing

- Deployment: ****\_\_\_****
- Full Flow: ****\_\_\_****
- Performance: ****\_\_\_****

---

**Status**: Ready for Testing ✅
**Next Step**: Run PHASE 1 tests and document results
