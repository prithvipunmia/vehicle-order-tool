import { getBikes } from "../../lib/googlesheets";
import React from "react";
import { BikesGroupedClient } from "./BikesGroupedClient";

interface Bike {
  BikeId?: string;
  VehicleName: string;
  Variant?: string;
  ExShowroomPrice?: number;
  Tax?: number;
  Insurance?: number;
  Ew?: number;
  OnRoadPrice: number;
}

interface GroupedBike {
  variant: string;
  items: Bike[];
}

/**
 * Server component: fetches bikes and groups them by Variant (column C).
 * If Variant is missing, falls back to VehicleName so every bike gets grouped.
 */
function groupByVariant(bikes: Bike[] = []): GroupedBike[] {
  const groups: Record<string, Bike[]> = {};
  bikes.forEach((b) => {
    // Assumes your sheet columns map to these keys:
    // b.VehicleName, b.Variant, b.BikeId, b.OnRoadPrice, etc.
    const variant = (b.Variant || b.VehicleName || "Other").trim();
    const key = variant || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  // Convert to array for predictable ordering
  return Object.entries(groups).map(([variant, items]) => ({
    variant,
    items,
  }));
}

export default async function ExplorePage() {
  const bikes = await getBikes();
  const grouped = groupByVariant(bikes || []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center bg-white shadow px-6 py-4">
        <h1 className="text-xl font-bold">Surya Honda</h1>
        <div className="flex gap-6">
          <a href="/explore" className="text-blue-600 font-medium">
            Explore
          </a>
          <a
            href="/previous-orders"
            className="text-gray-600 hover:text-blue-600"
          >
            Previous Orders
          </a>
        </div>
      </nav>

      {/* Explore Section */}
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-6">Explore Bikes</h2>

        {/* Client component renders interactive grouped UI */}
        <BikesGroupedClient groupedBikes={grouped} />
      </section>
    </main>
  );
}

export type { Bike, GroupedBike };
