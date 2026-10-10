
function SearchBar({ search, setSearch, onSearch }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <span className="search-icon">⌕</span>

      <input
        type="search"
        placeholder="Search album or artist..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search albums or artists"
      />

      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;
