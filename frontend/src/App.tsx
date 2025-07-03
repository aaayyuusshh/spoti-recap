import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { DownloadGoatCard } from "./DownloadGoatCard";
import { DownloadTop10Card } from "./DownloadTop10Card";
import { LandingPage } from "./LandingPage";
import { ScaledCardWrapper } from "./ScaledCardWrapper";


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
    console.log("in login useEffect");
    if(!fetchedRef.current) {
      const savedToken = localStorage.getItem("accessToken");
      if(savedToken) {
        fetchedRef.current = true;
        console.log(`using saved token: ${savedToken}`);
        setToken(savedToken);
        return;
      }

      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        fetchedRef.current = true; // ensure this useEffect only runs once
        console.log("no saved token");
        fetch("http://localhost:8080/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })
          .then(res => res.json())
          .then((data) => {
            setToken(data.access_token);
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);
            localStorage.setItem("tokenExpiry", (Date.now() + (3600 * 1000)).toString());
            window.history.replaceState({}, document.title, "/");
            // fetchTopData()
          });
      }
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
    console.log("fetch use effect running");
    fetchTopData();
    console.log("x");
  }, [token, selectedType, timeRange, amount]);


  function getTimeRangeLabel(timeRange: "short_term" | "medium_term" | "long_term"): string {
    switch(timeRange) {
      case("short_term"):
        return "in the past month";
      case "medium_term":
        return "in the past 6 months";
      default:
        return "of all time"
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    setToken(null);
    setData([]);
    setUserFirstName(null);
  }

  async function fetchTopData() {
    console.log('in fetchTopData');
    console.log(`token: ${token}`);

    if(!token) {
      console.log('No token; not fetching.');
      return;
    }
   
    const validToken = await getValidAccessToken();
    console.log(`validtToken: ${validToken}`);
    if (validToken) {
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
  }

  async function getValidAccessToken(): Promise<string | null> {
    console.log('in getValidAccessToken');
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if(!accessToken || ! refreshToken || !tokenExpiry) {
      console.log("No token/refresh/expiry found; not fetching.");
      return null;
    }
    
    console.log(`refresh token: ${refreshToken}`);
    console.log(`token expiry: ${tokenExpiry}`);
    console.log(`access token: ${accessToken}`);
    console.log(`state access token: ${token}`);

    if(Date.now() >= Number(tokenExpiry)) {
      console.log("access token refreshed...");
      const res = await fetch("http://localhost:8080/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({refresh_token: refreshToken})
        });

        const data = await res.json();
        if(data.access_token) {
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("tokenExpiry", (Date.now() + (3600 * 1000)).toString());
          setToken(data.access_token);
          return data.access_token;
        } 
        else {
          console.log("Failed to refresh token.");
          return null;
        }
    }

    return accessToken;
  }
  
  const downloadRef = useRef<HTMLDivElement>(null);
  const [showDownloadCard, setShowDownloadCard] = useState(false);
  async function handleDownload() {
    setShowDownloadCard(true);
    setTimeout(async () => {
      if (downloadRef.current) {
        const canvas = await html2canvas(downloadRef.current, {
          useCORS: true,
          backgroundColor: "#fff",
          width: 1080,
          height: 1920
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${userFirstName}_spotify_${selectedType}_${amount}.png`;
        link.click();
        setShowDownloadCard(false);
      }
    }, 100);
  }

  const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&show_dialog=true`;

  return (
  <>
   {!token ? (
      <LandingPage loginUrl={loginUrl} />
    ) 
    :
    (
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
          <div>
            <div className="flex justify-end w-full">
              <button
                className="fixed bottom-8 right-8 z-40 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl cursor-pointer"
                onClick={handleDownload}
              >
                Download
              </button>            
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 underline cursor-pointer">
                Logout
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold text-gray-700">Customize Your View</h3>
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 sm:gap-6 mt-4 w-full max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
                  <select
                    value={selectedType}
                    onChange={(e) => { setData([]); setSelectedType(e.target.value as any); }}
                    className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm"
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
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm"
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
                    onChange={(e) => setAmount(e.target.value as any)}
                    className="bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm"
                  >
                    <option value="10">Top 10</option>
                    <option value="1">GOAT</option>
                  </select>
                </div>
              </div>
              <div className="h-px bg-gray-300 my-6 w-full max-w-sm" />
            </div>

            {amount === "10" && (
              <h2 className="text-2xl font-bold text-gray-700 text-center">
                {selectedType === "tracks"
                  ? `${userFirstName}'s Top Tracks 💿`
                  : selectedType === "artists"
                    ? `${userFirstName}'s Top Artists 🧑‍🎤`
                    : `${userFirstName}'s Top Genres 🎼`}
              </h2>
            )}

            {amount === "1" ? (
              <div className="flex justify-center items-center w-full min-h-[60vh]">
              <ScaledCardWrapper>
                <DownloadGoatCard
                  data={data}
                  selectedType={selectedType}
                  userFirstName={userFirstName}
                  timeRange={timeRange}
                  displayMode={true}
                />
              </ScaledCardWrapper>
            </div>
            ) : (
            
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4  gap-y-tall gap-y-taller mt-6 font-fancy animate-fade-in px-2 sm:px-4">
                {data.map((item, index) => (
                  <li
                    key={index}
                    className="bg-white border border-gray-200 rounded-2xl p-2 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-4"
                  >
                    {selectedType === "tracks" && item.albumCoverUrl && (
                      <img
                        src={item.albumCoverUrl}
                        alt={item.name}
                        className="w-18 h-18 rounded-xl object-cover shadow-sm"
                      />
                    )}
                    {selectedType === "artists" && item.artistImageUrl && (
                      <img
                        src={item.artistImageUrl}
                        alt={item.name}
                        className="w-18 h-18 rounded-full object-cover shadow-sm"
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
         
            )}
          </div>
      </div>
    )}

    {showDownloadCard && (
      <div
        style={{
          position: "fixed",
          left: "-200vw",
          top: 0,
          width: 1080,
          height: 1920,
          zIndex: -9999,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div ref={downloadRef}>
          {amount === "1" ? (
            <DownloadGoatCard
              data={data}
              selectedType={selectedType}
              userFirstName={userFirstName}
              timeRange={timeRange}
            />
          ) : (
            <DownloadTop10Card
              data={data}
              selectedType={selectedType}
              userFirstName={userFirstName}
              timeRange={timeRange}
            />
          )}
        </div>
      </div>
    )}
  </>
  );
}

export default App;
