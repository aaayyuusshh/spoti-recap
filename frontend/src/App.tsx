import React, { useEffect, useState, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";
const SCOPE = "user-top-read";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<"tracks" | "artists" | "genres">("tracks");
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("long_term");

  const fetchedRef = useRef(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    if (code && !token && !fetchedRef.current) {
      fetchedRef.current = true; // ensure this useEffect only runs once

      fetch("http://localhost:8080/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => setToken(data.access_token));
    }
  }, []);

  useEffect(() => {
    if (token) {
      console.log("lol got token");
      const endpoint =
        selectedType == "tracks" ? "top-tracks" 
        : selectedType == "artists" ?  "top-artists"
        : "top-genres";

      fetch(`http://localhost:8080/api/${endpoint}?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setData(data));
    }
  }, [token, selectedType, timeRange]);

  const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

  return (
    <div className="p-8">
      {!token ? (
        <a
          href={loginUrl}
          className="bg-green-500 text-white p-4 rounded"
          target="_self"
          rel="noopener noreferrer"
        >
          Login with Spotify
        </a>
      ) : (
        <div>
          <h1 className="text-2xl text-green-600 font-semibold mb-4">Successfully authenticated ✅</h1>

          <div className="mb-4">
            <label className="mr-2 font-medium">View:</label>
            <select
              value={selectedType}
              onChange={(e) => {
                  setData([]);
                  setSelectedType(e.target.value as "tracks" | "artists" | "genres");
                }}
              className="p-2 rounded border border-gray-300"
            >
              <option value="tracks">Top Tracks</option>
              <option value="artists">Top Artists</option>
              <option value="genres">Top Genres</option>
            </select>

            <label className="mr-2 font-medium">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value as "short_term" | "medium_term" | "long_term");
              }}
              className="p-2 rounded border border-gray-300"
            >
              <option value="short_term">1 month</option>
              <option value="medium_term">6 months</option>
              <option value="long_term">All time</option>
            </select>
          </div>

          <ul>
            {data.map((item, index) => (
              <li key={index} className="py-1">
                {
                  selectedType === "tracks" 
                  ? `🎵 ${item.name} by ${item.artists}`
                  : selectedType === "artists" 
                  ? `🎤 ${item}`
                  : `🎧 ${item.genre} (${item.count}/50 artists)`
                }
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;