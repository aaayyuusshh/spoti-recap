const SCREENSHOTS = [
  "/assets/example1.png",
  "/assets/example2.png",
];

export function LandingPage({ loginUrl }: { loginUrl: string }) {
  return (
    <div className="px-4 min-h-screen flex flex-col items-center justify-center">
      <div className="mt-10 mb-4 flex flex-col items-center">
        <h1 className="text-5xl font-black tracking-tight text-gray-800 font-fancy drop-shadow-lg mb-3">
          SpotiRecap
        </h1>
        <div className="text-lg sm:text-xl text-gray-500 font-medium mb-2 text-center max-w-xl">
          Instantly see, download & share your Spotify top songs, artists, and genres as beautiful social graphics.
        </div>
      </div>

      <div className="flex flex-row gap-4 sm:gap-8 items-center justify-center mt-6 mb-8 flex-wrap">
        {SCREENSHOTS.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`YourSpotify preview ${idx + 1}`}
            className="rounded-2xl shadow-xl w-[240px] h-[426px] object-cover border border-gray-200 bg-white"
            style={{ aspectRatio: "9/16" }}
          />
        ))}
      </div>

      <a
        href={loginUrl}
        className="bg-green-600 hover:bg-green-700 transition text-white font-bold text-lg rounded-xl shadow-lg px-10 py-4 mt-4 mb-10"
        style={{ letterSpacing: ".04em" }}
      >
        Login with Spotify
      </a>

      <div className="mt-auto mb-4 text-xs text-gray-400">
        Made with 💚
      </div>
    </div>
  );
}
