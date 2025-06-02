import React, { useEffect, useState, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";
const SCOPE = "user-top-read";

function App() {
  const [token, setToken] = useState<string | null>(null);

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
          <h1 className="text-2xl text-green-600 font-semibold">Successfully authenticated ✅</h1>
        </div>
      )}
    </div>
  );
}

export default App;
