"use client";
import { useState, useEffect } from "react";
import DayCard from "@/components/DayCard";

const PASSWORD = "ireland2026";

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loadingTrip, setLoadingTrip] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("trip_authed");
    const savedName = localStorage.getItem("trip_name");
    if (saved === "yes") setAuthed(true);
    if (savedName) { setName(savedName); setNameSet(true); }
    fetch("/api/itinerary")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setItinerary(d); })
      .finally(() => setLoadingTrip(false));
  }, []);

  const login = () => {
    if (pw === PASSWORD) {
      setAuthed(true);
      localStorage.setItem("trip_authed", "yes");
      setError("");
    } else {
      setError("Wrong password. Try again.");
    }
  };

  const saveName = () => {
    if (name.trim()) {
      setNameSet(true);
      localStorage.setItem("trip_name", name.trim());
    }
  };

  if (!authed) return (
    <main className="min-h-screen bg-emerald-950 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-sm text-white text-center">
        <div className="text-5xl mb-4">☘️</div>
        <h1 className="text-2xl font-bold mb-1">Ireland & UK 2026</h1>
        <p className="text-emerald-300 text-sm mb-6">Enter the trip password to continue</p>
        <input
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
          type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <button onClick={login} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition">
          Let's Go ☘️
        </button>
      </div>
    </main>
  );

  if (!nameSet) return (
    <main className="min-h-screen bg-emerald-950 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-sm text-white text-center">
        <div className="text-5xl mb-4">👋</div>
        <h1 className="text-xl font-bold mb-2">Who are you?</h1>
        <p className="text-emerald-300 text-sm mb-6">Your name will appear on journal entries & photos</p>
        <input
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
          type="text" placeholder="Your name" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && saveName()}
        />
        <button onClick={saveName} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition">
          Continue
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-emerald-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">☘️🏰🎡</div>
          <h1 className="text-3xl font-bold">Ireland & UK 2026</h1>
          <p className="text-emerald-400 text-sm mt-1">April 2–12 · Hey {name}! 👋</p>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {itinerary.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                activeDay === i
                  ? "bg-emerald-500 text-white"
                  : "bg-white/10 text-emerald-300 hover:bg-white/20"
              }`}
            >
              {day.emoji} Apr {i + 2}
            </button>
          ))}
        </div>

        {/* Active Day */}
        {loadingTrip ? (
          <div className="text-center text-emerald-400 py-12 animate-pulse">Loading itinerary...</div>
        ) : itinerary[activeDay] ? (
          <DayCard day={itinerary[activeDay]} dayIndex={activeDay} userName={name} />
        ) : null}

        {/* Nav */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
            disabled={activeDay === 0}
            className="px-4 py-2 bg-white/10 rounded-lg text-sm disabled:opacity-30 hover:bg-white/20 transition"
          >
            ← Previous
          </button>
          <button
            onClick={() => setActiveDay(Math.min(itinerary.length - 1, activeDay + 1))}
            disabled={activeDay === itinerary.length - 1}
            className="px-4 py-2 bg-white/10 rounded-lg text-sm disabled:opacity-30 hover:bg-white/20 transition"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}
