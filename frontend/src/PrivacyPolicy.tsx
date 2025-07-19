export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Your privacy matters to us. This policy outlines how <strong>SpotiRecap</strong> collects, uses, and protects your
        data when you use our app.
      </p>

      <p className="mb-4">
        <u>Summary</u>: SpotiRecap utilizes the Spotify API to fetch/derive top tracks, artists, and genres data.
        We <strong>DO NOT</strong> store or share any data. All data is used just for the purpose of creating the recap card.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. What Data We Collect</h2>
      <p className="mb-4">
        When you log in with your Spotify account, we use Spotify’s authorization system (OAuth) to request permission to access
        your listening history. Specifically, we request the <code>user-top-read</code> permission, which allows us to fetch:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Your top tracks</li>
        <li>Your top artists</li>
        <li>Your top genres (derived from Spotify artist metadata)</li>
        <li>Your Spotify display name (first name, if available)</li>
      </ul>

      <p className="mb-4">
        We do <strong>not</strong> access your email, playlists, library, or private account data. We only request
        the minimum data necessary to generate your personalized recap.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
      <p className="mb-4">
        We use your Spotify data only to generate your visual recap cards, which you can download and share. Your data is never
        shared, sold, or used for advertising.
      </p>


      <h2 className="text-xl font-semibold mt-6 mb-2">3. Third-Party Services</h2>
      <p className="mb-4">
        SpotiRecap uses the <a className="text-blue-600 underline" href="https://developer.spotify.com/documentation/web-api/"
        target="_blank" rel="noopener noreferrer">Spotify Web API</a> to access your music data. Your use of SpotiRecap is
        also subject to Spotify’s own <a className="text-blue-600 underline"
        href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Analytics & Tracking</h2>
      <p className="mb-4">
        We do <strong>not</strong> use cookies, analytics tools (like Google Analytics), or any form of tracking in this app.
        Your usage is not monitored, recorded, or analyzed in any way.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Revoking Access</h2>
      <p className="mb-4">
        You may revoke SpotiRecap’s access to your Spotify account at any time by visiting the 
        <a className="text-blue-600 underline ml-1" href="https://www.spotify.com/account/apps/"
        target="_blank" rel="noopener noreferrer">Spotify Apps Dashboard</a>. 
        This will immediately disable our ability to access your data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this policy if the app's functionality changes. Any significant changes will be reflected here with a
        revised "Effective Date".
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact</h2>
      <p className="mb-4">
        If you have any questions or concerns about your data or this policy, feel free to contact us at:
      </p>
      <ul className="mb-4">
        <li>Email: <code>ad.codes100@gmail.com</code></li>
        <li>GitHub: <a className="text-blue-600 underline" href="https://github.com/aaayyuusshh/spoti-recap"
        target="_blank" rel="noopener noreferrer">SpotiRecap Repository</a></li>
      </ul>

      <p className="text-sm text-gray-500 mt-8">Effective Date: [2025-07-18]</p>
    </div>
  );
}
