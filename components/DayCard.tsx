"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Day = {
  date: string;
  location: string;
  hotel: string;
  transport: string;
  activities: string[];
  notes: string;
  emoji: string;
};

export default function DayCard({ day, dayIndex, userName }: { day: Day; dayIndex: number; userName: string }) {
  const [tab, setTab] = useState<"schedule" | "journal" | "photos">("schedule");
  const [entries, setEntries] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === "journal") loadJournal();
    if (tab === "photos") loadPhotos();
  }, [tab, dayIndex]);

  const loadJournal = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("day_index", dayIndex)
      .order("created_at", { ascending: true });
    setEntries(data || []);
  };

  const loadPhotos = async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("day_index", dayIndex)
      .order("created_at", { ascending: true });
    setPhotos(data || []);
  };

  const postEntry = async () => {
    if (!newEntry.trim()) return;
    setPosting(true);
    await supabase.from("journal_entries").insert({
      day_index: dayIndex,
      author: userName,
      content: newEntry.trim(),
    });
    setNewEntry("");
    await loadJournal();
    setPosting(false);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `day-${dayIndex}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("trip-photos").upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("trip-photos").getPublicUrl(path);
      await supabase.from("photos").insert({
        day_index: dayIndex,
        author: userName,
        url: publicUrl,
        caption: "",
      });
      await loadPhotos();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden">
      {/* Day Header */}
      <div className="bg-emerald-800/60 px-6 py-5">
        <div className="text-3xl mb-1">{day.emoji}</div>
        <h2 className="text-xl font-bold">{day.date}</h2>
        <p className="text-emerald-300 font-medium">{day.location}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(["schedule", "journal", "photos"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition ${tab === t ? "text-white border-b-2 border-emerald-400" : "text-emerald-400 hover:text-white"}`}>
            {t === "schedule" ? "📋 Schedule" : t === "journal" ? "📝 Journal" : "📸 Photos"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* SCHEDULE TAB */}
        {tab === "schedule" && (
          <div className="space-y-4">
            {day.hotel && (
              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">🏨 Hotel</p>
                <p className="text-sm text-white/90">{day.hotel}</p>
              </div>
            )}
            {day.transport && (
              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">🚗 Transport</p>
                <p className="text-sm text-white/90">{day.transport}</p>
              </div>
            )}
            {day.activities.length > 0 && (
              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">📍 Activities</p>
                <ul className="space-y-1.5">
                  {day.activities.map((a, i) => (
                    <li key={i} className="text-sm text-white/90 flex gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {day.notes && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">📌 Notes</p>
                <p className="text-sm text-white/80">{day.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* JOURNAL TAB */}
        {tab === "journal" && (
          <div>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {entries.length === 0 && (
                <p className="text-white/40 text-sm text-center py-6">No entries yet — be the first! ✍️</p>
              )}
              {entries.map((e) => (
                <div key={e.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-emerald-400">{e.author}</span>
                    <span className="text-xs text-white/30">{new Date(e.created_at).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" })}</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">{e.content}</p>
                </div>
              ))}
            </div>
            <textarea
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 resize-none"
              rows={3} placeholder="Write something about today..."
              value={newEntry} onChange={e => setNewEntry(e.target.value)}
            />
            <button onClick={postEntry} disabled={posting || !newEntry.trim()}
              className="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-sm transition">
              {posting ? "Posting..." : "Post Entry"}
            </button>
          </div>
        )}

        {/* PHOTOS TAB */}
        {tab === "photos" && (
          <div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {photos.length === 0 && (
                <p className="col-span-2 text-white/40 text-sm text-center py-6">No photos yet — add the first one! 📸</p>
              )}
              {photos.map((p) => (
                <div key={p.id} className="relative rounded-xl overflow-hidden aspect-square bg-white/5">
                  <img src={p.url} alt={p.caption || "Trip photo"} className="w-full h-full object-cover" />
                  {p.author && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-xs text-white/80">{p.author}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-sm transition">
              {uploading ? "Uploading..." : "📷 Add Photo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
