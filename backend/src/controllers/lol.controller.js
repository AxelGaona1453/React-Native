const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_BASE = "https://americas.api.riotgames.com";

const riotFetch = async (url) => {
  const response = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Riot API error ${response.status}: ${text}`);
  }

  return response.json();
};

export const getPlayerRecentMatches = async (req, res) => {
  try {
    const gameName = (req.query.gameName || "").trim();
    const tagLine = (req.query.tagLine || "").trim();
    const count = Math.min(Number(req.query.count || 5), 10);

    if (!gameName || !tagLine) {
      return res
        .status(400)
        .json({ error: "gameName y tagLine son obligatorios" });
    }

    if (!RIOT_API_KEY) {
      return res.status(503).json({
        error:
          "Falta RIOT_API_KEY en backend/.env. Configurala para ver partidas reales.",
      });
    }

    const account = await riotFetch(
      `${RIOT_BASE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    );

    const matchIds = await riotFetch(
      `${RIOT_BASE}/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=${count}`,
    );

    const details = await Promise.all(
      matchIds.map((id) =>
        riotFetch(`${RIOT_BASE}/lol/match/v5/matches/${id}`),
      ),
    );

    const matches = details.map((detail) => {
      const participant = detail.info.participants.find(
        (item) => item.puuid === account.puuid,
      );

      return {
        matchId: detail.metadata.matchId,
        championName: participant?.championName,
        result: participant?.win ? "Victoria" : "Derrota",
        kda: `${participant?.kills}/${participant?.deaths}/${participant?.assists}`,
        cs: (participant?.totalMinionsKilled || 0) + (participant?.neutralMinionsKilled || 0),
        gameDurationMinutes: Math.floor((detail.info.gameDuration || 0) / 60),
        queueId: detail.info.queueId,
      };
    });

    return res.status(200).json({
      player: {
        gameName: account.gameName,
        tagLine: account.tagLine,
        puuid: account.puuid,
      },
      matches,
      source: "riot",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
