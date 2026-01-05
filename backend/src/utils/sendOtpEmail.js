import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Cek koneksi
transporter.verify((err) => {
  if (err) console.error("SMTP Error:", err.message);
  else console.log("SMTP ready ✅");
});

export const sendOtpEmail = async (email, otp, retries = 3) => {
  const mailOptions = {
    from: `"Padel Booking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Kode Verifikasi Email Anda - Padel Booking",
    html: `
<!DOCTYPE html>
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#EEF2F7; font-family:'Poppins', Arial, sans-serif;">
    <div style="padding:32px 0; text-align:center;">

      <!-- CARD -->
      <div style="
        background:white;
        width:90%;
        max-width:420px;
        margin:0 auto;
        padding:28px 26px;
        border-radius:18px;
        box-shadow:0 6px 18px rgba(0,0,0,0.06);
      ">

        <!-- LOGO -->
      <h1 style="
            font-size:20px;
            margin:0;
            color:white;
            font-weight:600;
          ">Padel Booking</h1>

        <!-- TITLE -->
        <h2 style="
          font-size:18px;
          margin-bottom:8px;
          color:#111827;
          font-weight:600;
        ">
          Verifikasi Email Anda
        </h2>

        <p style="
          color:#6B7280;
          font-size:13px;
          margin-bottom:18px;
          line-height:1.5;
        ">
          Hai <b>${email}</b>, masukkan kode berikut untuk melanjutkan proses verifikasi akun:
        </p>

        <!-- OTP BOX -->
        <div style="
          background:#22c55e;
          color:white;
          padding:10px 0;
          border-radius:10px;
          font-size:24px;
          font-weight:600;
          letter-spacing:4px;
          width:100%;
          margin-bottom:14px;
        ">
          ${otp}
        </div>

        <p style="font-size:11px; color:#6B7280; margin-bottom:18px;">
          Salin kode secara manual untuk digunakan saat verifikasi.
        </p>

        <!-- WARNING BOX -->
        <div style="
          background:#FFF4D6;
          border-left:4px solid #FACC15;
          padding:10px 14px;
          border-radius:10px;
          text-align:left;
          margin-bottom:14px;
        ">
          <p style="color:#8A6D00; font-size:12px; margin:0; line-height:1.5;">
            <b>Peringatan:</b><br/>
            • Jangan bagikan OTP ini kepada siapa pun.<br/>
            • Tim kami tidak akan pernah meminta kode Anda.<br/>
            • Berlaku selama <b>5 menit</b>.
          </p>
        </div>

        <p style="color:#9CA3AF; font-size:11px; margin-top:10px;">
          Jika Anda tidak meminta kode ini, abaikan email ini.
        </p>
      </div>

      <p style="color:#9CA3AF; font-size:11px; margin-top:16px;">
        © ${new Date().getFullYear()} Padel Booking. Semua Hak Dilindungi.
      </p>
    </div>
  </body>
</html>

`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}:`, info.response);

    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${email}:`, error.message);

    if (retries > 0) {
      console.log(`⏱ Retrying in 2 seconds... attempts left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return sendOtpEmail(email, otp, retries - 1);
    }

    return { success: false };
  }
};
