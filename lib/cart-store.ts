import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  type: "ticket" | "merch"
  name: string
  price: number
  quantity: number
  image?: string
  // For tickets
  eventId?: string
  eventTitle?: string
  eventDate?: string
  tierId?: string
  tierName?: string
  maxPerOrder?: number
  // For merch
  productId?: string
  variantId?: string
  variantName?: string
  sku?: string
}

interface CartState {
  items: CartItem[]
  promoCode: string | null
  discount: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setPromoCode: (code: string | null, discount: number) => void
  getSubtotal: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discount: 0,

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === item.id)
          if (existingIndex >= 0) {
            const items = [...state.items]
            const existing = items[existingIndex]
            const maxQty = item.maxPerOrder || 10
            items[existingIndex] = {
              ...existing,
              quantity: Math.min(existing.quantity + item.quantity, maxQty),
            }
            return { items }
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxPerOrder || 10)) }
              : item
          ),
        })),

      clearCart: () => set({ items: [], promoCode: null, discount: 0 }),

      setPromoCode: (code, discount) => set({ promoCode: code, discount }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTotal: () => {
        const { getSubtotal, discount } = get()
        return Math.max(0, getSubtotal() - discount)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    }
  )
)
