"use client";

import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { fetchApprovedInfluencers } from "@/lib/public-api";
import InfluencerCard from "@/components/InfluencerCard";
import SkeletonCard from "@/components/SkeletonCard";

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInfluencers() {
      setLoading(true);
      setError(null);
      try {
        // Composite indexes required in Firestore:
        // (status ASC, createdAt DESC) for All Cities
        // (status ASC, city ASC, createdAt DESC) for city filter
        const data = await fetchApprovedInfluencers({
          city: selectedCity === "All Cities" ? null : selectedCity,
        });
        setInfluencers(data);
      } catch (err) {
        setError(err.message || "Failed to load influencers. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInfluencers();
  }, [selectedCity]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight text-balance">
            Find the Best Influencers{" "}
            <span className="text-indigo-600">in Your City</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto text-balance">
            Discover top local creators across India. Filter by city to find
            influencers in your area for your next brand collaboration.
          </p>
        </div>
      </section>

      {/* City filter + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="sticky top-16 z-40 bg-slate-50/90 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6">
          <div className="flex items-center gap-3 max-w-xs">
            <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              aria-label="Filter by city"
            >
              <option value="All Cities">All Cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No influencers found
              {selectedCity !== "All Cities" ? ` in ${selectedCity}` : ""}
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {selectedCity !== "All Cities"
                ? `We don't have any approved influencers in ${selectedCity} yet. Try another city or check back soon.`
                : "No approved influencers are listed yet. Be the first to join!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {influencers.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
