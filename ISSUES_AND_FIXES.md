# 🔧 ISSUES FOUND & FIX PLAN

## ISSUE 1: Admin Transaction Page Error

**Status**: ❌ NEEDS FIX

- Admin tidak bisa klik transaksi di dashboard
- Belum ada dedicated transaksi endpoint untuk admin
- **Fix**: Tambah transaksi endpoint di adminRoutes

## ISSUE 2: Lapangan Image Not Displaying

**Status**: ❌ NEEDS FIX

- Images di `/lapangan` folder tidak muncul
- Gambar hanya muncul setelah re-upload
- **Root Cause**: Image path mapping issue atau lazy loading
- **Fix**: Check image URL construction & serve static files properly

## ISSUE 3: Mitra Add/Edit Data Error

**Status**: ❌ NEEDS FIX

- Error saat tambah/edit data mitra
- Need to investigate exact error
- **Fix**: Review form submission & error handling

## FEATURE 1: Admin Earnings Dashboard

**Status**: ✋ PENDING

- New page untuk admin lihat pendapatan dari biaya admin
- Show fee yang sudah dikumpulkan
- **Implementation**: New page + controller endpoint

## FEATURE 2: Mitra Withdrawal System

**Status**: ✋ PENDING

- Page untuk mitra mencairkan dana
- Auto-read bank details dari data mitra
- Calculate net amount (dengan fee admin)
- **Implementation**: New page + withdrawal logic + fee system

## FEATURE 3: Withdrawal Approval (Admin)

**Status**: ✋ PENDING

- Page untuk admin approve/reject pencairan
- Show withdrawal details
- **Implementation**: Already have routes, need UI

---

## PRIORITY ORDER

1. **URGENT**: Fix image display issue (affects all lapangan)
2. **URGENT**: Fix admin transaksi endpoint
3. **HIGH**: Fix mitra add/edit error
4. **HIGH**: Implement withdrawal system with auto bank read
5. **MEDIUM**: Add admin earnings dashboard
6. **MEDIUM**: UI improvements for user experience

---

## FILES TO MODIFY

- `/backend/src/routes/adminRoutes.js` - Add transaksi endpoint
- `/backend/src/controller/lapanganController.js` - Fix image handling
- `/backend/src/routes/lapanganRoutes.js` - Check upload config
- `/backend/src/controller/mitra/` - Add withdrawal controller
- `/backend/src/middleware/uploadLapangan.js` - Check image config
