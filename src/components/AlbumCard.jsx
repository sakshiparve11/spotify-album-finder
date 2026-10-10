
function AlbumCard({ album }) {
  return (
    <article className="album-card">
      <a
        href={album.spotifyUrl}
        target="_blank"
        rel="noreferrer"
        className="album-cover-link"
      >
        <img
          src={album.image}
          alt={`${album.title} album cover`}
          className="album-cover"
        />
      </a>

      <div className="album-info">
        <h3>{album.title}</h3>
        <p>{album.artist}</p>
        <span>{album.releaseDate || "Release date unavailable"}</span>

        <a
          href={album.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="listen-link"
        >
          Explore on Spotify ↗
        </a>
      </div>
    </article>
  );
}

export default AlbumCard;
