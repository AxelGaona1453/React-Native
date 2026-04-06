function ChampionSearchBar({ value, onChange }) {
  return (
    <div className="search-container">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar campeon por nombre, titulo o rol..."
        className="search-input"
      />
    </div>
  );
}

export default ChampionSearchBar;
