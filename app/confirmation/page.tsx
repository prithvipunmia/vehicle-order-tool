"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bike } from "../../explore/page";

interface OrderItem {
  bikeKey: string;
  variant: string;
  vehicleName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quantitiesData = localStorage.getItem("bike-quantities");
    const quantities = quantitiesData ? JSON.parse(quantitiesData) : {};

    fetch("/api/bikes")
      .then((res) => res.json())
      .then((bikes: Bike[]) => {
        const items: OrderItem[] = [];
        let total = 0;

        const grouped: Record<string, Bike[]> = {};
        bikes.forEach((bike) => {
          const variant = (bike.Variant || bike.VehicleName || "Other").trim();
          if (!grouped[variant]) grouped[variant] = [];
          grouped[variant].push(bike);
        });

        Object.entries(grouped).forEach(([variant, bikesInVariant]) => {
          bikesInVariant.forEach((bike) => {
            const bikeKey = bike.BikeId || `${variant}-${bike.VehicleName}`;
            const qty = quantities[bikeKey] ?? 0;

            if (qty > 0) {
              const subtotal = qty * (bike.OnRoadPrice || 0);
              items.push({
                bikeKey,
                variant,
                vehicleName: bike.VehicleName,
                price: bike.OnRoadPrice || 0,
                quantity: qty,
                subtotal,
              });
              total += subtotal;
            }
          });
        });

        setOrderItems(items);
        setTotalAmount(total);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bikes:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    try {
      console.log("Order submitted:", { items: orderItems, total: totalAmount });
      localStorage.removeItem("bike-quantities");
      alert("Order submitted successfully!");
      router.push("/explore");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Error submitting order. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="flex justify-between items-center bg-white shadow px-6 py-4">
        <h1 className="text-xl font-bold">Order Confirmation</h1>
        <div className="flex gap-6">
          <a href="/explore" className="text-gray-600 hover:text-blue-600">Explore</a>
          <a href="/previous-orders" className="text-gray-600 hover:text-blue-600">Previous Orders</a>
        </div>
      </nav>

      <section className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
            <p className="text-blue-100">Please review your order before submitting</p>
          </div>

          {orderItems.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Items</h3>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.bikeKey} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{item.vehicleName}</div>
                      <div className="text-sm text-indigo-600 font-medium mt-1">{item.variant}</div>
                      <div className="text-sm text-gray-600 mt-2">Price: ₹{item.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-center mx-6">
                      <div className="text-sm text-gray-600 mb-1">Quantity</div>
                      <div className="text-2xl font-bold text-blue-600">{item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                      <div className="text-lg font-bold text-green-600">₹{item.subtotal.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2">Grand Total</div>
                  <div className="text-3xl font-bold text-green-600">₹{totalAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
              <p className="text-gray-600 text-lg">No items in your order</p>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button onClick={handleBack} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={orderItems.length === 0} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100">Submit Order</button>
          </div>
        </div>
      </section>
    </main>
  );
}
