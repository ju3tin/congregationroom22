'use client';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart, promoCode, discount, discountType } = useCartStore();
  const router = useRouter();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="bg-black text-white px-8 py-4 rounded-xl text-lg inline-block hover:bg-gray-800">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-6 border-b pb-8">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                  {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="mt-6 text-red-500 hover:text-red-700 text-sm"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-2xl p-8 sticky top-8">
            <h3 className="font-semibold text-xl mb-6">Order Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {promoCode && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode})</span>
                  <span>
                    -{discountType === 'PERCENTAGE' 
                      ? `${discount}%` 
                      : `$${discount}`}
                  </span>
                </div>
              )}

              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full mt-8 bg-black text-white py-4 rounded-xl text-lg font-medium hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </button>

            <Link href="/products" className="block text-center mt-4 text-sm text-gray-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
