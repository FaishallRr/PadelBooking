// Fungsi untuk menghasilkan OTP 6 digit
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Menghasilkan angka 6 digit
};
