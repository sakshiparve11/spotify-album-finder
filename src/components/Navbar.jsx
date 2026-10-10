
function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="logo">
        ♫ Album<span>Finder</span>
      </a>

      <a
        href="https://open.spotify.com/"
        target="_blank"
        rel="noreferrer"
        className="spotify-link"
      >
        Open Spotify ↗
      </a>
    </nav>
  );
}

export default Navbar;

