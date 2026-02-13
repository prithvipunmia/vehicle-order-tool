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
 *  - Each color has its own quantity control (min 0, max 5)
 *  - Quantities persist to localStorage under key "bike-quantities"
 *  - Shows total selected across all bikes and colors
 */
export function BikesGroupedClient({ groupedBikes }: { groupedBikes: GroupedBike[] }) {
  const router = useRouter();
  
  // Generate unique key for each bike + color combination
  const getUniqueKey = useMemo(() => {
    return (variant: string, vehicleName: string, price: string, index: number, color?: string): string => {
      // Create a truly unique key using all identifying information
      const baseKey = `${variant}__${vehicleName}__${price}__${index}`;
      return color ? `${baseKey}__${color}` : baseKey;
    };
  }, []);

  // Build initial quantities keyed by unique bike+color key
  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    groupedBikes.forEach((g) => {
      g.items.forEach((bike, idx) => {
        const baseKey = getUniqueKey(g.variant, bike.VehicleName, bike.OnRoadPrice, idx);
        // Create a key for each color or a default key if no colors
        if (bike.Colors && bike.Colors.length > 0) {
          bike.Colors.forEach((color) => {
            const colorKey = getUniqueKey(g.variant, bike.VehicleName, bike.OnRoadPrice, idx, color);
            map[colorKey] = 0;
          });
        } else {
          map[baseKey] = 0;
        }
      });
    });
    return map;
  }, [groupedBikes, getUniqueKey]);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem("bike-quantities");
      const parsed = stored ? JSON.parse(stored) : {};
      // Merge with initial to add any new color keys
      return { ...initial, ...parsed };
    } catch {
      return initial;
    }
  });

  // Whenever groupedBikes changes, sync quantities with valid keys only
  useEffect(() => {
    setQuantities((prev) => {
      const next: Record<string, number> = {};
      
      // Only keep quantities for bikes that currently exist
      groupedBikes.forEach((g) => {
        g.items.forEach((bike, idx) => {
          const baseKey = getUniqueKey(g.variant, bike.VehicleName, bike.OnRoadPrice, idx);
          if (bike.Colors && bike.Colors.length > 0) {
            bike.Colors.forEach((color) => {
              const colorKey = getUniqueKey(g.variant, bike.VehicleName, bike.OnRoadPrice, idx, color);
              next[colorKey] = prev[colorKey] ?? 0;
            });
          } else {
            next[baseKey] = prev[baseKey] ?? 0;
          }
        });
      });
      
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedBikes, getUniqueKey]);

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

  const changeQty = (key: string, delta: number) => {
    setQuantities((prev) => {
      const cur = prev[key] ?? 0;
      const next = Math.min(5, Math.max(0, cur + delta));
      if (next === cur) return prev;
      
      return { ...prev, [key]: next };
    });
  };

  const totalSelected: number = Object.entries(quantities).reduce((total, [key, qty]) => {
    // Each entry is a single vehicle-color combination, so just add up all quantities
    return total + (qty || 0);
  }, 0);

  const totalPurchaseAmount: number = groupedBikes.reduce((sum, group) => {
    return (
      sum +
      group.items.reduce((groupSum, bike, idx) => {
        const baseKey = getUniqueKey(group.variant, bike.VehicleName, bike.OnRoadPrice, idx);
        const price = typeof bike.OnRoadPrice === 'string' ? parseFloat(bike.OnRoadPrice) : (bike.OnRoadPrice || 0);
        
        if (bike.Colors && bike.Colors.length > 0) {
          // Sum quantities across all colors for this bike
          return (
            groupSum +
            bike.Colors.reduce((colorSum, color) => {
              const colorKey = getUniqueKey(group.variant, bike.VehicleName, bike.OnRoadPrice, idx, color);
              const qty = quantities[colorKey] ?? 0;
              return colorSum + qty * price;
            }, 0)
          );
        } else {
          const qty = quantities[baseKey] ?? 0;
          return groupSum + qty * price;
        }
      }, 0)
    );
  }, 0);

  const handlePlaceOrder = () => {
    if (totalSelected === 0) {
      alert("Please select at least one bike");
      return;
    }
    router.push("/confirmation");
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
              <div className="mt-4 space-y-4">
                {group.items.map((bike: Bike, idx: number) => {
                  const baseKey = getUniqueKey(group.variant, bike.VehicleName, bike.OnRoadPrice, idx);
                  const hasColors = bike.Colors && bike.Colors.length > 0;
                  
                  // Calculate total qty for this bike across all colors
                  const bikeTotal = hasColors && bike.Colors
                    ? bike.Colors.reduce((sum, color) => {
                        const colorKey = getUniqueKey(group.variant, bike.VehicleName, bike.OnRoadPrice, idx, color);
                        return sum + (quantities[colorKey] ?? 0);
                      }, 0)
                    : quantities[baseKey] ?? 0;
                  
                  return (
                    <div
                      key={baseKey}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-base">{bike.VehicleName}</div>
                          <div className="text-lg text-green-600 font-bold mt-1">
                            ₹{bike.OnRoadPrice}
                          </div>
                          {bikeTotal > 0 && (
                            <div className="text-sm text-blue-600 font-medium mt-1">
                              Total for this model: {bikeTotal}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Color Selection with Quantity Controls */}
                      {hasColors && bike.Colors ? (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">Select Color & Quantity:</label>
                          {bike.Colors.map((color) => {
                            const colorKey = getUniqueKey(group.variant, bike.VehicleName, bike.OnRoadPrice, idx, color);
                            const qty = quantities[colorKey] ?? 0;
                            return (
                              <div key={color} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                <span className="font-medium text-gray-700">{color}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    aria-label={`Decrease ${color} quantity`}
                                    onClick={() => changeQty(colorKey, -1)}
                                    disabled={qty <= 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:border-red-400 hover:text-red-600 disabled:opacity-40 transition-colors font-semibold"
                                  >
                                    −
                                  </button>
                                  <div className="w-10 text-center font-bold text-lg text-blue-600 bg-blue-50 rounded-md py-1">
                                    {qty}
                                  </div>
                                  <button
                                    aria-label={`Increase ${color} quantity`}
                                    onClick={() => changeQty(colorKey, +1)}
                                    disabled={qty >= 5}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-green-50 hover:border-green-400 hover:text-green-600 disabled:opacity-40 transition-colors font-semibold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* No colors - show single quantity control */
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity:</label>
                          <div className="flex items-center gap-2">
                            <button
                              aria-label={`Decrease ${bike.VehicleName} quantity`}
                              onClick={() => changeQty(baseKey, -1)}
                              disabled={bikeTotal <= 0}
                              className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:border-red-400 hover:text-red-600 disabled:opacity-40 transition-colors font-semibold"
                            >
                              −
                            </button>
                            <div className="w-10 text-center font-bold text-lg text-blue-600 bg-blue-50 rounded-md py-1">
                              {bikeTotal}
                            </div>
                            <button
                              aria-label={`Increase ${bike.VehicleName} quantity`}
                              onClick={() => changeQty(baseKey, +1)}
                              disabled={bikeTotal >= 5}
                              className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-green-50 hover:border-green-400 hover:text-green-600 disabled:opacity-40 transition-colors font-semibold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
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
