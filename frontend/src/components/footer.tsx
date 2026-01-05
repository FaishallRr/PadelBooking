import localFont from "next/font/local";
import { FaInstagram, FaWhatsapp, FaTwitter } from "react-icons/fa";

const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });

const Footer = () => {
  return (
    <footer className={`bg-gray-50 py-8 mt-10 ${PoppinsRegular.className}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-700 text-sm font-medium">
          {/* Footer Links */}
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <p className="hover:text-800 cursor-pointer transition">
              Tentang Kami
            </p>
            <p className="hover:text-800 cursor-pointer transition">Bantuan</p>
            <p className="hover:text-800 cursor-pointer transition">
              Kebijakan Privasi
            </p>
            <p className="hover:text-800 cursor-pointer transition">
              Syarat & Ketentuan
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <FaInstagram className="w-6 h-6 cursor-pointer hover:scale-110 hover:text-pink-600 transition" />
            <FaWhatsapp className="w-6 h-6 cursor-pointer hover:scale-110 hover:text-green-600 transition" />
            <FaTwitter className="w-6 h-6 cursor-pointer hover:scale-110 hover:text-blue-500 transition" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-300 my-6 opacity-60"></div>

        {/* Bottom Section */}
        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Padel Booking. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
