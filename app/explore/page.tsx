import { getBikes } from "../../lib/googlesheets";

export default async function ExplorePage() {
  // Fetch bikes directly on the server
  const bikes = await getBikes();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center bg-white shadow px-6 py-4">
        <h1 className="text-xl font-bold">Surya Honda</h1>
        <div className="flex gap-6">
          <a href="/explore" className="text-blue-600 font-medium">
            Explore
          </a>
          <a href="/previous-orders" className="text-gray-600 hover:text-blue-600">
            Previous Orders
          </a>
        </div>
      </nav>

      {/* Explore Section */}
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-6">Explore Bikes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className="border p-4 rounded bg-white shadow-sm flex flex-col gap-2"
            >
              <h3 className="font-semibold">{bike.name}</h3>
              <p className="text-gray-600">{bike.variant}</p>
              <p className="text-blue-600 font-bold">₹{bike.onRoadPrice}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
