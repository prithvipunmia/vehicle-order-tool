"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  bikeKey: string;
  vehicleName: string;
  color: string;
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
    try {
      const quantitiesData = localStorage.getItem("bike-quantities");
      const quantities = quantitiesData ? JSON.parse(quantitiesData) : {};

      // Build items from quantities
      const items: OrderItem[] = [];
      let total = 0;

      Object.entries(quantities).forEach(([key, qty]: [string, any]) => {
        if (qty > 0) {
          // Parse the key format: "bikeKey-color" where bikeKey could contain "-"
          // We need to split from the end to get the color
          const parts = key.split("-");
          const color = parts[parts.length - 1]; // Last part is the color
          const bikeKeyPart = parts.slice(0, -1).join("-"); // Everything else is bikeKey
          
          // Extract bike info from the key
          // Format is typically: "BikeId-index" or "variant-VehicleName-price-index"
          const keyParts = key.split("-");
          
          // We'll need to fetch bike data to get the vehicle name and price
          // For now, we can parse what's available
          const vehicleName = bikeKeyPart || "Unknown Bike";
          const price = 0; // Will be calculated below

          items.push({
            bikeKey: bikeKeyPart,
            vehicleName,
            color,
            price,
            quantity: qty,
            subtotal: 0,
          });
        }
      });

      // Fetch bikes to get prices
      fetch("/api/bikes")
        .then((res) => res.json())
        .then((bikes: any[]) => {
          const itemsWithPrices = items.map((item) => {
            // Try to find matching bike
            const bike = bikes.find((b: any) => {
              const variant = (b.Variant || b.VehicleName || "Other").trim();
              const bikeKey = b.BikeId && b.BikeId.trim() 
                ? `${b.BikeId}-0` 
                : `${variant}-${b.VehicleName}-${b.ExShowroomPrice}-0`;
              return bikeKey === item.bikeKey || b.VehicleName === item.vehicleName;
            });

            const price = bike ? parseFloat(bike.OnRoadPrice || 0) : 0;
            const subtotal = price * item.quantity;
            total += subtotal;

            return {
              ...item,
              vehicleName: bike?.VehicleName || item.vehicleName,
              price,
              subtotal,
            };
          });

          setOrderItems(itemsWithPrices);
          setTotalAmount(total);
        })
        .catch((err) => {
          console.error("Error fetching bikes:", err);
          setOrderItems(items);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error("Error processing order:", err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading order details...</div>;
  }

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Items Selected</h1>
          <p className="text-gray-600 mb-6">You haven't selected any bikes to order.</p>
          <button
            onClick={() => router.push("/explore")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Confirmation</h1>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-4">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.vehicleName}</div>
                  <div className="text-sm text-gray-600">Color: {item.color}</div>
                  <div className="text-sm text-gray-600">Price per unit: ₹{item.price.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Quantity: {item.quantity}</div>
                  <div className="font-semibold text-gray-900">₹{item.subtotal.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Amount:</span>
            <span className="text-3xl font-bold text-green-600">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/explore")}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Back to Explore
          </button>
          <button
            onClick={() => {
              alert("Order placed successfully!");
              localStorage.removeItem("bike-quantities");
              router.push("/explore");
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}
