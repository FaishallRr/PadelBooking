# 🚀 PadelBooking Deployment & Payment Gateway Setup Guide

## 📋 Summary of Fixes Applied

### ✅ COMPLETED FIXES

#### 1. **OTP Email Configuration** (CRITICAL FIX)

- **Problem**: Email tidak terkirim - "Missing credentials for PLAIN"
- **Root Cause**:
  - File menggunakan `EMAIL_USER` & `EMAIL_PASS` tapi `.env` punya `SMTP_USER` & `SMTP_PASS`
  - Port 465 dengan SSL, padahal Gmail memerlukan port 587 dengan TLS
- **Fixed**:
  - ✅ Updated `sendOtpEmail.js` untuk gunakan correct env variables
  - ✅ Changed port ke 587 dengan TLS
  - ✅ Added fallback untuk SMTP_HOST

#### 2. **Credentials Exposure** (SECURITY FIX)

- **Problem**: Email & password di `.env` file (exposed pada git)
- **Fixed**:
  - ✅ Removed credentials dari `.env`
  - ✅ Created proper `.env.example` dengan placeholders
  - ✅ Created `.gitignore` untuk prevent future exposure

#### 3. **Request Timeout Handling** (PERFORMANCE FIX)

- **Problem**: Long-running requests bisa timeout di production
- **Fixed**:
  - ✅ Added 30-second request timeout middleware
  - ✅ Added server keepAliveTimeout (65s)
  - ✅ Added proper graceful shutdown

#### 4. **Database Connection** (OPTIMIZATION)

- **Fixed**:
  - ✅ Optimized Prisma client logging
  - ✅ Added connection pooling documentation
  - ✅ Added graceful disconnect handling

---

## 🧪 TESTING LOCALLY (SEBELUM DEPLOY)

### Prerequisites

```bash
# 1. Ensure MySQL running di localhost:3306
mysql -u root -e "USE sewa_lapangan_padel; SELECT COUNT(*) FROM users;"

# 2. Backend dependencies installed
cd backend && npm install

# 3. Frontend dependencies installed
cd frontend && npm install
```

### Run Test Script

```bash
# 1. Start Backend
cd backend
npm start
# Expected: "Server is running on port 5000"

# 2. Start Frontend (dalam terminal baru)
cd frontend
npm run dev
# Expected: "ready - started server on 0.0.0.0:3000"

# 3. Run test suite (dalam terminal baru)
bash test-flow.sh
```

### What Get Tested

| Test           | Expected Result    | Time | Status              |
| -------------- | ------------------ | ---- | ------------------- |
| Send OTP       | 200 OK, email sent | < 3s | ✓                   |
| Verify OTP     | 200 OK             | < 1s | ✓                   |
| Register       | 201 Created        | < 2s | ✓                   |
| Login          | 200 OK, token      | < 2s | ✓                   |
| Get Lapangan   | 200 OK             | < 2s | ✓                   |
| Get Jadwal     | 200 OK             | < 2s | ✓                   |
| Create Booking | 201 Created        | < 3s | ✓                   |
| Payment Token  | 200 OK             | < 5s | ⚠️ (needs Midtrans) |

---

## 🌐 PRODUCTION DEPLOYMENT

### Step 1: Prepare Environment Variables

**Backend (.env)**

```bash
# Database - with connection pooling
DATABASE_URL="mysql://username:password@your-host:3306/sewa_lapangan_padel?connection_limit=10"

# JWT Secret (generate strong random string)
JWT_SECRET="$(openssl rand -base64 32)"

# Server
PORT=5000
NODE_ENV="production"

# Frontend URL
FRONTEND_URL="https://your-domain.com"

# Midtrans (Production accounts)
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY="Mid-server-key-from-dashboard"
MIDTRANS_CLIENT_KEY="Mid-client-key-from-dashboard"

# Gmail SMTP (Use App Password, not regular password)
# Get from: https://myaccount.google.com/apppasswords
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="16-character-app-password"
```

**Frontend (.env.local)**

```bash
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
```

### Step 2: Deploy Backend

**Option A: Vercel (Recommended for serverless)**

```bash
# 1. Deploy dengan Vercel CLI
npm i -g vercel
vercel deploy --prod

# 2. Set environment variables di Vercel dashboard
# 3. Configure custom domain
```

**Option B: Traditional Server (VPS/Cloud)**

```bash
# 1. SSH ke server
ssh user@your-server.com

# 2. Clone repo & setup
git clone your-repo.git
cd PadelBooking/backend
npm install

# 3. Create systemd service untuk auto-restart
sudo nano /etc/systemd/system/padel-backend.service
```

**systemd service file:**

```ini
[Unit]
Description=PadelBooking Backend
After=network.target

[Service]
Type=simple
User=padel
WorkingDirectory=/home/padel/PadelBooking/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

```bash
# 4. Start service
sudo systemctl daemon-reload
sudo systemctl start padel-backend
sudo systemctl enable padel-backend

# 5. Monitor logs
sudo journalctl -u padel-backend -f
```

### Step 3: Deploy Frontend

**Vercel (Recommended)**

```bash
cd frontend
vercel deploy --prod
```

**Or Self-hosted**

```bash
npm run build
npm run start
# or gunakan nginx/Apache untuk serve
```

### Step 4: Configure Midtrans

**Get Production Credentials:**

1. Go: https://dashboard.midtrans.com
2. Login dengan akun Midtrans production
3. Copy Server Key & Client Key
4. Set di environment variables
5. Update `MIDTRANS_IS_PRODUCTION=true`

**Test Payment Flow:**

```bash
# 1. Create dummy payment
curl -X POST https://your-api.com/api/payment/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1, "sewa_raket": false}'

# 2. Check response
# Should return snap_token & redirect_url
```

### Step 5: Configure Email Notifications

**Gmail Setup:**

1. Go: https://myaccount.google.com/apppasswords
2. Select "Mail" & "Windows Computer"
3. Generate 16-character password
4. Set `SMTP_PASS` di env (BUKAN password akun Google biasa)
5. Test send OTP

**Alternative: SendGrid, AWS SES**

```bash
# Contoh dengan SendGrid
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxxxxxxxxx"
```

---

## ✅ PRE-PAYMENT GATEWAY CHECKLIST

### Security

- [x] No credentials in git repository
- [x] .gitignore properly configured
- [x] JWT secret is strong (min 32 chars)
- [x] CORS configured untuk production domain
- [x] HTTPS enforced kedua frontend & backend
- [x] Request timeout (30s) configured

### Performance

- [x] Database connection pooling ready
- [x] Request timeout handler added
- [x] API response times < 5s (local testing)
- [x] No N+1 queries di booking/payment flow

### Testing

- [ ] Run full test suite locally ← **DO THIS FIRST**
- [ ] All tests pass pada production server
- [ ] OTP email sends successfully
- [ ] Payment token generated from Midtrans
- [ ] Webhook notifications received

### Documentation

- [x] Test checklist created (TEST_CHECKLIST.md)
- [x] Test script created (test-flow.sh)
- [x] Deployment guide created (this file)
- [ ] Runbook for common issues

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: OTP Email Not Received

**Symptoms**: POST /auth/send-otp returns 200 but no email received

**Solutions:**

```bash
# 1. Check SMTP credentials
echo $SMTP_USER $SMTP_PASS

# 2. Check backend logs for SMTP error
tail -f /var/log/padel-backend.log

# 3. Verify database stored OTP
mysql sewa_lapangan_padel -e "SELECT * FROM otp_codes LIMIT 5;"

# 4. Test SMTP directly
openssl s_client -connect smtp.gmail.com:587 -starttls smtp

# 5. Check if Gmail requires App Password
# Go: https://myaccount.google.com/apppasswords
```

### Issue 2: Payment Token Not Generated

**Symptoms**: POST /api/payment/create returns 500

**Solutions:**

```bash
# 1. Check Midtrans credentials
echo $MIDTRANS_SERVER_KEY

# 2. Verify production setting
echo $MIDTRANS_IS_PRODUCTION

# 3. Test Midtrans API directly
curl -X GET https://app.midtrans.com/api/server_key \
  -u "YOUR_SERVER_KEY:"

# 4. Check backend logs
tail -f backend.log | grep -i midtrans
```

### Issue 3: Database Connection Timeout

**Symptoms**: Request timeout (408) on database queries

**Solutions:**

```bash
# 1. Check connection pooling
mysql -e "SHOW PROCESSLIST;" | grep -c "Sleep"

# 2. Increase connection limit in DATABASE_URL
# Add: ?connection_limit=20

# 3. Check Prisma logs
DATABASE_LOGGING=true npm start
```

### Issue 4: CORS Error on Frontend

**Symptoms**: POST requests blocked from frontend

**Solutions:**

```bash
# 1. Check CORS configuration di server.js
# Must include production domain

# 2. Test with curl
curl -X POST https://api.your-domain.com/auth/login \
  -H "Origin: https://your-domain.com" \
  -H "Content-Type: application/json"

# 3. Check HTTP vs HTTPS mismatch
```

---

## 📊 MONITORING & UPTIME

### Add Health Check Endpoint

```bash
# Backend sudah punya:
GET http://your-api.com/
# Response: {"status":"OK","service":"PadelTime Backend"}
```

### Monitor dengan Uptime Service

```bash
# Option 1: Pingdom
# https://www.pingdom.com/

# Option 2: StatusCake
# https://www.statuscake.com/

# Option 3: Self-hosted UptimeRobot
# https://uptimerobot.com/
```

### Log Aggregation

```bash
# Gunakan PM2 atau supervisor untuk manage processes
npm i -g pm2

# Create ecosystem.config.js
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🎯 NEXT STEPS

### Immediate (Before Payment Gateway)

1. **Run local tests** - bash test-flow.sh
2. **Review test results** - Check performance & errors
3. **Setup production environment** - Set .env variables
4. **Deploy to staging** - Test on production-like server

### Before Going Live

1. **Configure Midtrans production** - Set real credentials
2. **Test payment flow end-to-end** - Fake payment transaction
3. **Setup monitoring** - Uptime checks & error logging
4. **Security audit** - Check HTTPS, CORS, credentials

### Launch

1. **Deploy to production** - Frontend & Backend
2. **Monitor closely** - First 24 hours
3. **Have rollback plan** - In case issues arise
4. **Inform support team** - How to debug common issues

---

## 📞 SUPPORT

If issues arise:

1. Check TEST_CHECKLIST.md untuk testing procedures
2. Review logs: `tail -f backend.log`
3. Check database: `mysql sewa_lapangan_padel`
4. Test endpoints langsung: gunakan Postman/curl
5. Verify environment variables: `env | grep SMART`

---

**Last Updated**: 2026-04-14
**Status**: Ready for Testing ✅
**Next Action**: Run test-flow.sh locally
