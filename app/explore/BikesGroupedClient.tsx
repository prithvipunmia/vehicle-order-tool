"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bike, GroupedBike } from "./page";

/**
 * BikesGroupedClient
 *
 * Props:
 *  - groupedBikes: [{ variant: 'Activa', items: [bike,...] }, ...]
 *
 * Behavior:
 *  - Shows each variant as a group (e.g., Activa)
 *  - Each individual bike has its own quantity control (min 0, max 5)
 *  - Quantities persist to localStorage under key "bike-quantities"
 *  - Shows total selected across all bikes
 */
export function BikesGroupedClient({ groupedBikes }: { groupedBikes: GroupedBike[] }) {
  const router = useRouter();
  // Build initial quantities keyed by bike ID
  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    groupedBikes.forEach((g) => {
      g.items.forEach((bike) => {
        const bikeKey = bike.BikeId || `${g.variant}-${bike.VehicleName}`;
        map[bikeKey] = 0;
      });
    });
    return map;
  }, [groupedBikes]);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem("bike-quantities");
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  // Keep quantities in sync if groupedBikes changes (e.g., new groups added)
  useEffect(() => {
    setQuantities((prev) => {
      const next = { ...prev };
      Object.keys(initial).forEach((k) => {
        if (!(k in next)) next[k] = 0;
      });
      // Remove keys that no longer exist
      Object.keys(next).forEach((k) => {
        if (!(k in initial)) delete next[k];
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedBikes.length]);

  useEffect(() => {
    try {
      localStorage.setItem("bike-quantities", JSON.stringify(quantities));
    } catch {}
  }, [quantities]);

  const changeQty = (bikeKey: string, delta: number) => {
    setQuantities((prev) => {
      const cur = prev[bikeKey] ?? 0;
      const next = Math.min(5, Math.max(0, cur + delta));
      if (next === cur) return prev;
      return { ...prev, [bikeKey]: next };
    });
  };

  const totalSelected: number = Object.values(quantities).reduce((s: number, v) => s + (v || 0), 0);

  const totalPurchaseAmount: number = groupedBikes.reduce((sum, group) => {
    return (
      sum +
      group.items.reduce((groupSum, bike) => {
        const bikeKey = bike.BikeId || `${group.variant}-${bike.VehicleName}`;
        const qty = quantities[bikeKey] ?? 0;
        return groupSum + qty * (bike.OnRoadPrice || 0);
      }, 0)
    );
  }, 0);

  const handlePlaceOrder = () => {
    if (totalSelected === 0) {
      alert("Please select at least one bike");
      return;
    }
    router.push("/order/confirmation");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
        <div className="text-lg font-bold">
          Qty: <span className="text-yellow-300">{totalSelected}</span>
        </div>
        <div className="text-lg font-bold">
          Total: <span className="text-yellow-300">₹{totalPurchaseAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="space-y-4">
        {groupedBikes.map((group: GroupedBike) => {
          return (
            <div key={group.variant} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-600 rounded-lg shadow-md p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">{group.variant}</h3>
                  <div className="text-sm text-indigo-700 font-medium mt-1">
                    {group.items.length} model{group.items.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Models list */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((bike: Bike) => {
                  const bikeKey = bike.BikeId || `${group.variant}-${bike.VehicleName}`;
                  const qty = quantities[bikeKey] ?? 0;
                  return (
                    <div
                      key={bikeKey}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="font-bold text-gray-900 text-base">{bike.VehicleName}</div>
                        <div className="text-lg text-green-600 font-bold mt-2">
                          ₹{bike.OnRoadPrice}
                        </div>
                      </div>

                      {/* Individual bike quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Decrease ${bike.VehicleName} quantity`}
                          onClick={() => changeQty(bikeKey, -1)}
                          disabled={qty <= 0}
                          className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:border-red-400 hover:text-red-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-colors font-semibold"
                        >
                          <span className="text-xl leading-none">−</span>
                        </button>

                        <div
                          aria-live="polite"
                          className="w-12 text-center font-bold text-lg text-blue-600 bg-blue-50 rounded-md py-1"
                        >
                          {qty}
                        </div>

                        <button
                          aria-label={`Increase ${bike.VehicleName} quantity`}
                          onClick={() => changeQty(bikeKey, +1)}
                          disabled={qty >= 5}
                          className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-green-50 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-colors font-semibold"
                        >
                          <span className="text-xl leading-none">+</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={totalSelected === 0}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100 text-lg"
      >
        Place Order ({totalSelected} items - ₹{totalPurchaseAmount.toLocaleString('en-IN')})
      </button>
    </div>
  );
}
