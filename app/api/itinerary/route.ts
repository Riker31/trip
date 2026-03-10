import { NextResponse } from "next/server";
import { ITINERARY } from "@/lib/itinerary";

const SHEET_ID = "1rm07ANbJVkAM3u-I7eL4LTnctwaakzFjKmHoRcukeFg";
const API_KEY = process.env.GOOGLE_API_KEY;

const EMOJIS = ["✈️","🏰","🌊","🐣","🏔️","🎵","🛫","🏴󠁧󠁢󠁷󠁬󠁳󠁿","🚂","🎡","✈️"];

export async function GET() {
  try {
    const range = "Sheet1!A2:H15";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 60 } }); // cache 60s
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Sheets API error");

    const rows: string[][] = data.values || [];

    const days = rows
      .filter(r => r[0]?.trim()) // must have a date
      .map((row, i) => ({
        date: row[0] || "",
        location: row[1] || "",
        hotel: row[2] || "",
        laundry: row[3] || "",
        transport: row[4] || "",
        activities: row[5] || "",
        notes: row[6] || "",
        packing: row[7] || "",
        emoji: EMOJIS[i] || "📍",
      }));

    return NextResponse.json(days);
  } catch (err: any) {
    // Fallback to hardcoded itinerary if Sheets API fails
    return NextResponse.json(ITINERARY);
  }
}
