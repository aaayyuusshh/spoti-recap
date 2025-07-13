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

export function App() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<"tracks" | "artists" | "genres">("tracks");
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("long_term");
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [amount, setAmount] = useState<"10" | "1">("10");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchedRef = useRef(false);
  useEffect(() => {
    console.log("in login useEffect");
    if(!fetchedRef.current) {
      const savedToken = localStorage.getItem("accessToken");
      if(savedToken) {
        fetchedRef.current = true;
        console.log(`login useEffect: using saved token: ${savedToken}`);
        setToken(savedToken);
        return;
      }

      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        setLoading(true);
        fetchedRef.current = true; // ensure this useEffect only runs once
        console.log("login useEffect: no saved token");
        fetchWithErrorHandling(
          "http://localhost:8080/api/auth/token", 
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          })
          .then((data) => {
            setToken(data.access_token);
            console.log("login useEffect: token set");
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);
            localStorage.setItem("tokenExpiry", (Date.now() + (3600 * 1000)).toString());
            window.history.replaceState({}, document.title, "/");
            // fetchTopData()
          })
          .catch(err => {
            console.error(`Failed to fetch access token:`, err.message);
          })
          .finally(() => {
            setLoading(false)
          });
      }
    }
  }, []);

  useEffect(() => {
    console.log("in user useEffect");
    if(token) {
      fetchWithErrorHandling(
        "http://localhost:8080/api/user", 
        { headers: { Authorization: `Bearer ${token}` }
      })
        .then(data => setUserFirstName(data.userFirstName))
        .catch (err  => {
          console.error(`Failed to fetch user:`, err.message);
        })
    }
  },[token]);

  useEffect(() => {
    console.log("in fetch useEffect");
    fetchTopData();
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

  async function fetchWithErrorHandling(url: string, options: object = {}) {
    const res = await fetch(url, options);
    let data;
    try {
      data = await res.json();
    } 
    catch (e) {
      data = null;
    }

    if(!res.ok) {
      throw new Error(`[${res.status}] ${data?.error}` || `Request failed with status ${res.status}`);
    }

    return data;
  }

  async function fetchTopData() {
    console.log('in fetchTopData()');
    console.log(`fetchTopData(): token: ${token}`);

    if(!token) {
      console.log('fetchTopData(): No token - not fetching.');
      return;
    }
   
    const validToken = await getValidAccessToken();

    if (validToken) {
      console.log("fetchTopData() - got valid token from getValidAccessToken()");
      const endpoint =
        selectedType == "tracks" ? "top-tracks"
        : selectedType == "artists" ?  "top-artists"
        : "top-genres";

      try {
        const data = await fetchWithErrorHandling(
          `http://localhost:8080/api/${endpoint}?timeRange=${timeRange}&amount=${amount}`, 
          { headers: { Authorization: `Bearer ${token}` } },
         
        );
        setData(data);
      } 
      catch(err: any) {
        console.error("Failed to fetch top data:", err.message);
      }
    }
  }

  async function getValidAccessToken(): Promise<string | null> {
    console.log('in getValidAccessToken()');
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if(!accessToken || ! refreshToken || !tokenExpiry) {
      console.log("getValidAccessToken(): No token/refresh/expiry found-not checking token validity.");
      return null;
    }

    if(Date.now() >= Number(tokenExpiry)) {
      console.log("getValidAccessToken(): access token refreshed..");
      try {
        const data = await fetchWithErrorHandling(
          "http://localhost:8080/api/auth/refresh", 
          {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({refresh_token: refreshToken})
          }
        );
     
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
      catch (err: any) {
        console.error("Failed to refresh:", err.message);
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
  
  if (loading) {
    return <div className="py-12 text-center text-xl">Loading...</div>;
  }

  return (
  <>
   {!token ? (
      <LandingPage loginUrl={loginUrl} />
    ) 
    :
    (
      <div className="p-4 min-h-screen">
        <div className="flex justify-between items-center w-full py-2 px-4 mb-4">
          {/* <p className="text-sm text-blue-500 underline" ><a href="">Privacy Notice</a></p> */}
           <span className="underline text-xl font-bold text-700">YourSpotify</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-sm text-white px-4 py-2 rounded-md transition cursor-pointer"
          >
            Logout
          </button>
        </div>
        
        <div className="flex flex-1 flex-col items-center justify-center w-full">
          {/* row on big screens, column on mobile */}
          <div className="flex flex-col lg:flex-row lg:items-start items-center justify-center w-full gap-10 mt-6">
            {/* dropdown section */}
            <div className="w-full max-w-xs flex-shrink-0 flex flex-col items-center">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">Customize Your View</h3>
              <div className="flex flex-col gap-4 w-full">
                {/* view dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
                  <select
                    value={selectedType}
                    onChange={(e) => { setData([]); setSelectedType(e.target.value as any); }}
                    className="bg-white border border-black-300 rounded-md px-4 py-2 shadow-sm w-full"
                  >
                    <option value="tracks">Top Tracks</option>
                    <option value="artists">Top Artists</option>
                    <option value="genres">Top Genres</option>
                  </select>
                </div>
                {/* time range dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="bg-white border border-black rounded-md px-4 py-2 shadow-sm w-full"
                  >
                    <option value="short_term">1 month</option>
                    <option value="medium_term">6 months</option>
                    <option value="long_term">All time</option>
                  </select>
                </div>
                {/* amount dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <select
                    value={amount}
                    onChange={(e) => setAmount(e.target.value as any)}
                    className="bg-white border border-black rounded-md px-4 py-2 shadow-sm w-full"
                  >
                    <option value="10">Top 10</option>
                    <option value="1">GOAT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* display */}
            <div className="flex flex-col items-center justify-center w-full max-w-2xl">
              {amount === "1" ? (
                <ScaledCardWrapper>
                  <DownloadGoatCard
                    data={data}
                    selectedType={selectedType}
                    userFirstName={userFirstName}
                    timeRange={timeRange}
                    displayMode={true}
                  />
                </ScaledCardWrapper>
              ) : (
                <ScaledCardWrapper>
                  <DownloadTop10Card
                    data={data}
                    selectedType={selectedType}
                    userFirstName={userFirstName}
                    timeRange={timeRange}
                    displayMode={true}
                  />
                </ScaledCardWrapper>
              )}
              <button
                className="mt-5 bg-green-600 text-white px-6 py-2 rounded-xl shadow-xl cursor-pointer text-lg font-semibold transition hover:bg-green-700"
                onClick={handleDownload}
              >
                Download
              </button>
            </div>
          </div>
        </div>

      </div>
    )}

    {/* download version of display */}
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

