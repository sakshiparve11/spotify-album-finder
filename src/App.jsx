
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AlbumCard from "./components/AlbumCard";
import {
  loginWithSpotify,
  handleSpotifyCallback,
  searchSpotifyAlbums,
} from "./services/spotify";
import "./App.css";



const sampleAlbums = [
  {
    id: "midnights",
    title: "Midnights",
    artist: "Taylor Swift",
    releaseDate: "2022-10-21",
    image: "https://coverartarchive.org/release/e348fdd6-f73b-47fe-94c4-670bfee26a39/front-500",
    spotifyUrl: "https://open.spotify.com/search/Midnights",
  },
  {
    id: "divide",
    title: "÷ (Divide)",
    artist: "Ed Sheeran",
    releaseDate: "2017-03-03",
    image: "https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png",
    spotifyUrl: "https://open.spotify.com/search/Divide",
  },
  {
    id: "after-hours",
    title: "After Hours",
    artist: "The Weeknd",
    releaseDate: "2020-03-20",
    image: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png",
    spotifyUrl: "https://open.spotify.com/search/After+Hours",
  },
  {
    id: "sour",
    title: "SOUR",
    artist: "Olivia Rodrigo",
    releaseDate: "2021-05-21",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
    spotifyUrl: "https://open.spotify.com/search/SOUR",
  },
  {
    id: "future-nostalgia",
    title: "Future Nostalgia",
    artist: "Dua Lipa",
    releaseDate: "2020-03-27",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500",
    spotifyUrl: "https://open.spotify.com/search/Future+Nostalgia",
  },
  {
    id: "starboy",
    title: "Starboy",
    artist: "The Weeknd",
    releaseDate: "2016-11-25",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
    spotifyUrl: "https://open.spotify.com/search/Starboy",
  },
  {
    id: "divide-and-conquer",
    title: "Happier Than Ever",
    artist: "Billie Eilish",
    releaseDate: "2021-07-30",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500",
    spotifyUrl: "https://open.spotify.com/search/Happier+Than+Ever",
  },
  {
    id: "1989",
    title: "1989",
    artist: "Taylor Swift",
    releaseDate: "2014-10-27",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500",
    spotifyUrl: "https://open.spotify.com/search/1989+Taylor+Swift",
  },
  {
    id: "fine-line",
    title: "Fine Line",
    artist: "Harry Styles",
    releaseDate: "2019-12-13",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500",
    spotifyUrl: "https://open.spotify.com/search/Fine+Line+Harry+Styles",
  },
];




function SpotifyCallback() {
  const [status, setStatus] = useState("Connecting to Spotify...");

  useEffect(() => {
    let active = true;

    async function connectSpotify() {
      try {
        await handleSpotifyCallback();

        if (active) {
          // Automatically return to the homepage
          window.location.replace("/");
        }
      } catch (error) {
        if (active) {
          setStatus(`Login failed: ${error.message}`);
        }
      }
    }

    connectSpotify();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-container callback-page">
      <h1>Spotify Login</h1>
      <p>{status}</p>
      <a href="/" className="listen-link">
        Back to Album Finder
      </a>
    </main>

  );
}
//profile hover//




function App() {
  const [search, setSearch] = useState("");
  const [loginError, setLoginError] = useState("");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  if (window.location.pathname === "/callback") {
    return <SpotifyCallback />;
  }

  const displayedAlbums =
    albums.length > 0
      ? albums
      : sampleAlbums.filter((album) =>
          `${album.title} ${album.artist}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        );

  async function handleLogin() {
    setLoginError("");

    try {
      await loginWithSpotify();
    } catch (error) {
      setLoginError(
        error.message || "Unable to start Spotify login."
      );
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    setSearchError("");
    setAlbums([]);

    if (!search.trim()) {
      return;
    }

    if (!sessionStorage.getItem("spotify_access_token")) {
      setSearchError(
        "Showing sample matches. Log in with Spotify to search its catalogue."
      );
      return;
    }

    try {
      setLoading(true);
      const results = await searchSpotifyAlbums(search);
      setAlbums(results);
    } catch (error) {
      setSearchError(error.message || "Unable to search Spotify.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="app-container">
        <section className="hero-section">
          <p className="eyebrow">YOUR MUSIC DISCOVERY SPACE</p>

          <h1>
            Discover Your Next
            <br />
            <span className="highlight-text">Favorite Album</span>
          </h1>

          <p className="hero-description">
            Explore albums, find artists, and discover your next
            repeat-worthy record.
          </p>

          <button
            type="button"
            className="spotify-login"
            onClick={handleLogin}
          >
            ♫ Login with Spotify
          </button>

          {loginError && (
            <p className="error-message">{loginError}</p>
          )}

          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search an album or artist..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setAlbums([]);
                setSearchError("");
              }}
              aria-label="Search albums or artists"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchError && (
            <p className="status-message">{searchError}</p>
          )}

          {loading && (
            <p className="status-message">
              Searching Spotify for albums...
            </p>
          )}
        </section>

        <section className="discover-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PICK YOUR NEXT LISTEN</p>
              <h2>
                {search.trim() ? "Search Matches" : "Featured Albums"}
              </h2>
            </div>

            <span className="section-caption">
              {displayedAlbums.length} albums
            </span>
          </div>

          

          {displayedAlbums.length > 0 ? (
            <section className="album-grid">
              {displayedAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </section>
          ) : (
            !loading && (
              <p className="status-message">
                No sample matches found. Log in and search Spotify
                for more results.
              </p>
            )
          )}
        </section>

        <footer className="page-footer">
          Made for music lovers. Discover something new.
        </footer>
      </main>
    </>
  );
}

export default App;




