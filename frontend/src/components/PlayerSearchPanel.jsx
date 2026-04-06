function PlayerSearchPanel({ riotForm, setRiotForm, playerData, onSearchMatches }) {
  return (
    <section className="panel">
      <h2 className="section-title">Buscar jugador y ultimas partidas</h2>
      <form className="inline-form" onSubmit={onSearchMatches}>
        <input
          className="search-input"
          placeholder="gameName (ej: Faker)"
          value={riotForm.gameName}
          onChange={(e) =>
            setRiotForm((prev) => ({ ...prev, gameName: e.target.value }))
          }
        />
        <input
          className="search-input"
          placeholder="tagLine (ej: KR1)"
          value={riotForm.tagLine}
          onChange={(e) =>
            setRiotForm((prev) => ({ ...prev, tagLine: e.target.value }))
          }
        />
        <button type="submit">Buscar partidas</button>
      </form>

      {playerData && (
        <div className="matches-list">
          <p>
            {playerData.player.gameName}#{playerData.player.tagLine}
          </p>
          {playerData.matches.map((match) => (
            <article key={match.matchId} className="match-card">
              <strong>{match.championName}</strong> - {match.result} - KDA {match.kda} - CS {match.cs} - {match.gameDurationMinutes} min
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PlayerSearchPanel;
