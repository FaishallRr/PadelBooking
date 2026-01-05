import Cookies from "js-cookie";
import { CartItem } from "@/types/cart";

const CART_KEY = "cart";

/* ================= GET CART ================= */
export const getCart = (userId: number): CartItem[] => {
  if (!userId) return [];

  try {
    const raw = Cookies.get(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const cart = parsed[`user_${userId}`];

    return Array.isArray(cart) ? cart : [];
  } catch (err) {
    console.error("Cart cookie rusak:", err);
    return [];
  }
};

/* ================= ADD TO CART ================= */
export const addToCart = (userId: number, item: CartItem) => {
  if (!userId || !item?.jadwalId) return;

  let parsed: Record<string, CartItem[]> = {};

  try {
    const raw = Cookies.get(CART_KEY);
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }

  const key = `user_${userId}`;
  const cart: CartItem[] = Array.isArray(parsed[key]) ? parsed[key] : [];

  // 🚫 cegah jadwal dobel
  const exists = cart.some((c) => c.jadwalId === item.jadwalId);
  if (exists) return;

  cart.push(item);
  parsed[key] = cart;

  Cookies.set(CART_KEY, JSON.stringify(parsed), { expires: 7 });
  window.dispatchEvent(new Event("cartUpdated"));
};

/* ================= REMOVE ITEM ================= */
export const removeFromCart = (userId: number, jadwalId: number) => {
  if (!userId || !jadwalId) return;

  try {
    const raw = Cookies.get(CART_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const key = `user_${userId}`;

    if (!Array.isArray(parsed[key])) return;

    parsed[key] = parsed[key].filter(
      (item: CartItem) => item.jadwalId !== jadwalId
    );

    Cookies.set(CART_KEY, JSON.stringify(parsed), { expires: 7 });
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.error("Gagal remove cart:", err);
  }
};

/* ================= CLEAR CART ================= */
export const clearCart = (userId: number) => {
  if (!userId) return;

  try {
    const raw = Cookies.get(CART_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    delete parsed[`user_${userId}`];

    Cookies.set(CART_KEY, JSON.stringify(parsed), { expires: 7 });
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.error("Gagal clear cart:", err);
  }
};
