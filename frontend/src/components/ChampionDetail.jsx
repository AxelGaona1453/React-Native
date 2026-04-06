function BuildSection({ elo, build }) {
  const renderItems = (items) => (
    <div className="item-row">
      {items.map((item) => (
        <div key={`${elo}-${item.name}`} className="item-chip" title={item.name}>
          <img src={item.image} alt={item.name} />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <article className="build-card">
      <h4>{elo}</h4>
      <p><strong>Inicio</strong></p>
      {renderItems(build.starting)}
      <p><strong>Core</strong></p>
      {renderItems(build.core)}
      <p><strong>Situacionales</strong></p>
      {renderItems(build.situational)}
      <p><strong>Botas</strong></p>
      {renderItems(build.boots)}
    </article>
  );
}

function ChampionDetail({ champion, loading }) {
  if (loading) {
    return <p className="status-message">Cargando detalle del campeon...</p>;
  }

  if (!champion) {
    return (
      <p className="status-message">
        Selecciona un campeon para ver su build recomendada por elo.
      </p>
    );
  }

  return (
    <section className="detail-panel">
      <header className="detail-header">
        <img src={champion.image} alt={champion.name} />
        <div>
          <h2>{champion.name}</h2>
          <p>{champion.title}</p>
          <span>{champion.tags.join(" / ")}</span>
        </div>
      </header>

      <p className="champion-blurb">{champion.blurb}</p>

      <h3>Build por elo</h3>
      <div className="build-grid">
        {Object.entries(champion.buildByElo).map(([elo, build]) => (
          <BuildSection key={elo} elo={elo} build={build} />
        ))}
      </div>
    </section>
  );
}

export default ChampionDetail;
