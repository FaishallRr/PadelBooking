import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

interface Wallet {
  id: number;
  saldo: string;
  history: any[];
}

interface WalletStore {
  wallet: Wallet | null;
  fetchWallet: () => Promise<void>;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,

  fetchWallet: async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/wallet/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ wallet: res.data });
    } catch (err) {
      console.error("Fetch wallet error:", err);
    }
  },

  clearWallet: () => set({ wallet: null }),
}));
