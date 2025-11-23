"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "../common/header";
import Footer from "../common/footer";
import { Trash2 } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: "Táo Mỹ", price: 50000, qty: 2, image: "/products/apple.jpg" },
    { id: 2, name: "Bưởi Năm Roi", price: 80000, qty: 1, image: "/products/grapefruit.jpg" },
  ]);

  const incrementQty = (id: number) => {
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decrementQty = (id: number) => {
    setCartItems(prev =>
      prev
        .map(item => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter(item => item.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <>
      <Header  />

      <main className="pt-38 bg-gray-50 py-10 px-4 md:px-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Giỏ hàng</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-600">
            <p className="text-lg mb-4">Giỏ hàng của bạn đang trống</p>
            <Link
              href="/"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Quay lại mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 space-y-4">
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3 border-b border-gray-200 rounded-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div>
                        <h2 className="font-semibold">{item.name}</h2>
                        <p className="text-gray-500">{item.price.toLocaleString()} đ</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => decrementQty(item.id)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                        >
                          -
                        </button>
                        <span className="px-4">{item.qty}</span>
                        <button
                          onClick={() => incrementQty(item.id)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Cart Summary */}
            <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
              <h2 className="font-semibold text-lg">Tóm tắt đơn hàng</h2>
              <div className="flex justify-between">
                <span>Tổng số lượng:</span>
                <span>{totalQty}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Tổng tiền:</span>
                <span>{totalPrice.toLocaleString()} đ</span>
              </div>

              <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
