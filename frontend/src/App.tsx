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
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [amount, setAmount] = useState<"10" | "1">("10");

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
    if(token) {
      fetch("http://localhost:8080/api/user", {
        headers: { Authorization: `Bearer ${token}`} 
      })
        .then(res => res.json())
        .then(data => setUserFirstName(data.userFirstName));
    }
  },[token]);

  useEffect(() => {
    if (token) {
      console.log("lol got token");
      const endpoint =
        selectedType == "tracks" ? "top-tracks" 
        : selectedType == "artists" ?  "top-artists"
        : "top-genres";

      fetch(`http://localhost:8080/api/${endpoint}?timeRange=${timeRange}&amount=${amount}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setData(data));
    }
  }, [token, selectedType, timeRange, amount]);

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
      ) : 
      (
        <div>
          <h3 className="text-xl font-semibold text-gray-600">Customize Your View</h3>
          <div className="flex flex-wrap items-center gap-6 mt-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setData([]);
                  setSelectedType(e.target.value as "tracks" | "artists" | "genres");
                }}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="tracks">Top Tracks</option>
                <option value="artists">Top Artists</option>
                <option value="genres">Top Genres</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value as "short_term" | "medium_term" | "long_term");
                }}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="short_term">1 month</option>
                <option value="medium_term">6 months</option>
                <option value="long_term">All time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <select
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value as "10" | "1");
                }}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="10">Top 10</option>
                <option value="1">GOAT</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-300 my-6 w-[310px]" />

          <h2 className="text-2xl font-bold text-gray-700">
            {selectedType === "tracks"
              ? `${userFirstName}'s Top Tracks 💿`
              : selectedType === "artists"
              ? `${userFirstName}'s Top Artists 🧑‍🎤 `
              : `${userFirstName}'s Top Genres 🎼`
            }
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 font-fancy animate-fade-in">
            {amount == "1" ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">

                {selectedType === "tracks" && data[0]?.albumCoverUrl && (
                  <img
                    src={data[0].albumCoverUrl}
                    alt={data[0].name}
                    className="w-20 h-20 rounded-xl object-cover shadow-sm"
                  />
                )}
            
                {selectedType === "artists" && data[0]?.artistImageUrl && (
                  <img
                    src={data[0].artistImageUrl}
                    alt={data[0].name}
                    className="w-20 h-20 rounded-full object-cover shadow-sm"
                  />
                )}

                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {selectedType === "genres" ? data[0]?.genre : data[0]?.name}
                  </div>
            
                  {selectedType === "tracks" && (
                    <div className="text-sm text-gray-500 mt-1">by {data[0]?.artists}</div>
                  )}
            
                  {selectedType === "genres" && (
                    <div className="text-sm text-gray-500 mt-1">{data[0]?.count} of your top 50 artists</div>
                  )}
                </div>
              </div>
            )
            : 
            data.map((item, index) => (
              <li
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-4"
              >

                {selectedType === "tracks" && item.albumCoverUrl && (
                  <img
                    src={item.albumCoverUrl}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shadow-sm"
                  />
                )}

                {selectedType === "artists" && item.artistImageUrl && (
                    <img
                      src={item.artistImageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-full object-cover shadow-sm"
                    />
                )}

                <div className="flex flex-col justify-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {selectedType === "tracks"
                      ? item.name
                      : selectedType === "artists"
                      ? item.name
                      : item.genre}
                  </div>

                  {selectedType === "tracks" && (
                    <div className="text-sm text-gray-500 mt-1">by {item.artists}</div>
                  )}

                  {selectedType === "genres" && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.count} of your top 50 artists
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;