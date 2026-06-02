import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

interface CartStore {
  items: CartItem[];
  promoCode: string | null;
  discount: number; // percentage or fixed amount
  discountType: 'PERCENTAGE' | 'FIXED' | null;

  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyPromoCode: (code: string, discount: number, type: 'PERCENTAGE' | 'FIXED') => void;
  clearPromoCode: () => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discount: 0,
      discountType: null,

      addToCart: (item) => {
        const existing = get().items.findIndex(
          (i) => i.productId === item.productId && i.size === item.size
        );
        if (existing !== -1) {
          const updated = [...get().items];
          updated[existing].quantity += item.quantity;
          set({ items: updated });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeFromCart: (productId, size) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }),

      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }),

      applyPromoCode: (code, discount, type) =>
        set({ promoCode: code, discount, discountType: type }),

      clearPromoCode: () =>
        set({ promoCode: null, discount: 0, discountType: null }),

      clearCart: () => set({ items: [], promoCode: null, discount: 0, discountType: null }),

      getTotal: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const { discount, discountType } = get();

        if (discountType === 'PERCENTAGE') {
          return subtotal * (1 - discount / 100);
        } else if (discountType === 'FIXED') {
          return Math.max(0, subtotal - discount);
        }
        return subtotal;
      },
    }),
    { name: 'cart-storage' }
  )
);
