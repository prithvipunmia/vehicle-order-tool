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
  
  // Generate unique key for each bike with fallback strategy - memoized
  const getBikeKey = useMemo(() => {
    return (variant: string, bike: Bike, index: number): string => {
      // Use BikeId as primary key if available
      if (bike.BikeId && bike.BikeId.trim()) {
        // But append index to ensure uniqueness even if BikeIds are duplicated
        return `${bike.BikeId}-${index}`;
      }
      // Fallback: construct unique key from available data
      const fallbackKey = `${variant}-${bike.VehicleName}-${bike.ExShowroomPrice}`;
      return `${fallbackKey}-${index}`;
    };
  }, []);

  // Build initial quantities keyed by bike ID
  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    groupedBikes.forEach((g) => {
      g.items.forEach((bike, idx) => {
        const bikeKey = getBikeKey(g.variant, bike, idx);
        map[bikeKey] = 0;
      });
    });
    return map;
  }, [groupedBikes]);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    try {
      // Always start with initial keys only, ignore stale localStorage
      return initial;
    } catch {
      return initial;
    }
  });

  // Whenever groupedBikes changes, sync quantities with valid keys only
  useEffect(() => {
    console.log("=== BIKES GROUPING RECOMPUTED ===");
    console.log("GroupedBikes:", groupedBikes);
    
    setQuantities((prev) => {
      const next: Record<string, number> = {};
      
      // Only keep quantities for bikes that currently exist
      groupedBikes.forEach((g) => {
        console.log(`Processing variant: ${g.variant}`);
        g.items.forEach((bike, idx) => {
          const bikeKey = getBikeKey(g.variant, bike, idx);
          console.log(`  Bike ${idx}: BikeId="${bike.BikeId}", Name="${bike.VehicleName}", Key="${bikeKey}"`);
          next[bikeKey] = prev[bikeKey] ?? 0;
        });
      });
      
      console.log("Final quantity keys:", Object.keys(next));
      console.log("Keys are unique?", new Set(Object.keys(next)).size === Object.keys(next).length);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedBikes]);

  useEffect(() => {
    try {
      localStorage.setItem("bike-quantities", JSON.stringify(quantities));
    } catch {}
  }, [quantities]);

  // On mount, clear any stale localStorage data
  useEffect(() => {
    // This ensures we start with a clean slate for new bike configurations
    return () => {
      // Cleanup is optional, but we keep localStorage for persistence
    };
  }, []);

  const changeQty = (bikeKey: string, delta: number) => {
    setQuantities((prev) => {
      const cur = prev[bikeKey] ?? 0;
      const next = Math.min(5, Math.max(0, cur + delta));
      if (next === cur) return prev;
      
      // Debug log to show which bike is being updated
      if (typeof window !== "undefined") {
        console.log(`Updated bike: ${bikeKey}, quantity: ${next}`);
      }
      
      return { ...prev, [bikeKey]: next };
    });
  };

  const totalSelected: number = Object.values(quantities).reduce((s: number, v) => s + (v || 0), 0);

  const totalPurchaseAmount: number = groupedBikes.reduce((sum, group) => {
    return (
      sum +
      group.items.reduce((groupSum, bike, idx) => {
        const bikeKey = getBikeKey(group.variant, bike, idx);
        const qty = quantities[bikeKey] ?? 0;
        const price = typeof bike.OnRoadPrice === 'string' ? parseFloat(bike.OnRoadPrice) : (bike.OnRoadPrice || 0);
        return groupSum + qty * price;
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
                {group.items.map((bike: Bike, idx: number) => {
                  const bikeKey = getBikeKey(group.variant, bike, idx);
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
