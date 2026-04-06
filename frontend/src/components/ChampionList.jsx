function ChampionList({ champions, selectedChampionId, onSelect }) {
  if (!champions.length) {
    return <p className="empty-state">No se encontraron campeones.</p>;
  }

  return (
    <div className="champion-grid">
      {champions.map((champion) => (
        <button
          key={champion.id}
          type="button"
          className={`champion-card ${
            selectedChampionId === champion.id ? "active" : ""
          }`}
          onClick={() => onSelect(champion.id)}
        >
          <img src={champion.image} alt={champion.name} className="champion-image" />
          <div className="champion-meta">
            <h3>{champion.name}</h3>
            <p>{champion.title}</p>
            <small>{champion.tags.join(" / ")}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ChampionList;
