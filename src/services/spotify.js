
const CLIENT_ID = "4938d6d8d5a14a879450bf6904a37b08";
const REDIRECT_URI = "http://127.0.0.1:5177/callback";

const TOKEN_KEY = "spotify_access_token";

// Convert bytes into a URL-safe Base64 string
function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Start Spotify login using PKCE
export async function loginWithSpotify() {
  const verifier = base64UrlEncode(
    crypto.getRandomValues(new Uint8Array(32))
  );

  sessionStorage.setItem("spotify_verifier", verifier);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );

  const challenge = base64UrlEncode(new Uint8Array(digest));

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: "user-read-private user-read-email",
  });

  window.location.href =
    `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange authorization code for an access token
export async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (params.has("error")) {
    throw new Error(params.get("error"));
  }

  if (!code) {
    throw new Error("Authorization code is missing. Please log in again.");
  }

  const verifier = sessionStorage.getItem("spotify_verifier");

  if (!verifier) {
    throw new Error("Login verifier is missing. Please log in again.");
  }

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `${data.error || "Error"}: ${
        data.error_description || "Token exchange failed."
      }`
    );
  }

  sessionStorage.setItem(TOKEN_KEY, data.access_token);

  if (data.refresh_token) {
    sessionStorage.setItem("spotify_refresh_token", data.refresh_token);
  }

  if (data.expires_in) {
    sessionStorage.setItem(
      "spotify_token_expiry",
      String(Date.now() + data.expires_in * 1000)
    );
  }

  sessionStorage.removeItem("spotify_verifier");

  // Remove the one-time authorization code from the URL
  window.history.replaceState({}, document.title, "/callback");

  return data.access_token;
}

// Make an authenticated Spotify API request
async function spotifyRequest(url) {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error("Please log in with Spotify first.");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    throw new Error("Your Spotify session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(
      `${data.error?.status || response.status}: ${
        data.error?.message || "Spotify request failed."
      }`
    );
  }

  return data;
}

// Get the logged-in Spotify user's profile
export async function getSpotifyProfile() {
  const profile = await spotifyRequest(
    "https://api.spotify.com/v1/me"
  );

  return {
    id: profile.id,
    name: profile.display_name || profile.id,
    email: profile.email || "",
    image: profile.images?.[0]?.url || "",
    profileUrl: profile.external_urls?.spotify || "",
  };
}

// Confirm whether an access token is saved
export function hasSpotifyToken() {
  return Boolean(sessionStorage.getItem(TOKEN_KEY));
}

// Search Spotify for real albums
export async function searchSpotifyAlbums(query) {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    type: "album",
    limit: "12",
  });

  const data = await spotifyRequest(
    `https://api.spotify.com/v1/search?${params.toString()}`
  );

  return (data.albums?.items || []).map((album) => ({
    id: album.id,
    title: album.name,
    artist: album.artists.map((artist) => artist.name).join(", "),
    releaseDate: album.release_date,
    image: album.images?.[0]?.url || "",
    spotifyUrl: album.external_urls?.spotify || "",
  }));
}

