import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  size: string
  inStock: boolean
}

interface User {
  id: string
  email: string
  name: string
  role: string
  businessStatus?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getTotalSavings: () => number
}

interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

interface UIStore {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  notifications: Array<{
    id: string
    type: "success" | "error" | "info" | "warning"
    message: string
    timestamp: number
  }>
  addNotification: (notification: Omit<UIStore["notifications"][0], "id" | "timestamp">) => void
  removeNotification: (id: string) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          })
        }
      },
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })
      },
      clearCart: () => {
        set({ items: [] })
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      getTotalSavings: () => {
        return get().items.reduce(
          (total, item) => total + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
          0,
        )
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
    },
  ),
)

export const useUIStore = create<UIStore>((set, get) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const timestamp = Date.now()
    set({
      notifications: [...get().notifications, { ...notification, id, timestamp }],
    })

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)
  },
  removeNotification: (id) => {
    set({
      notifications: get().notifications.filter((n) => n.id !== id),
    })
  },
}))
