import axios from "axios"; // Gunakan import
import crypto from "crypto"; // Gunakan import

const API_KEY = process.env.TRIPAY_API_KEY;
const PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const BASE_URL = process.env.TRIPAY_BASE_URL;

function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
  return crypto
    .createHmac("sha256", PRIVATE_KEY)
    .update(stringToSign)
    .digest("hex");
}

export async function createQrisTransaction(orderId, amount) {
  // Gunakan export
  const endpoint = `${BASE_URL}/transaction/create`;

  const body = {
    method: "QRIS",
    merchant_ref: orderId,
    amount,
    customer_name: "CUSTOMER",
    customer_email: "customer@example.com",
    return_url: "", // opsional
    expiry_period: 10, // menit
  };

  const signature = generateSignature(body);
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "X-Signature": signature,
  };

  const res = await axios.post(endpoint, body, { headers });
  return res.data;
}
