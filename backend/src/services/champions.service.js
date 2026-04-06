const DDRAGON_CHAMPIONS_URL =
  "https://ddragon.leagueoflegends.com/cdn/14.x.1/data/es_ES/champion.json";
const DDRAGON_VERSIONS_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";

const CACHE_TTL_MS = 10 * 60 * 1000;

let championsCache = null;
let lastFetchAt = 0;
let activeVersion = "14.x.1";
const UNKNOWN_ITEM_ID = "7050";

const ITEM_ID_BY_NAME = {
  "Escudo de Doran": "1054",
  "Pocion de vida": "2003",
  "Pocion reutilizable": "2031",
  "Espada de Doran": "1055",
  "Anillo de Doran": "1056",
  "Cuchilla negra": "3071",
  "Baile de la muerte": "6333",
  "Malla de espinas": "3075",
  "Angel guardian": "3026",
  "Hidra voraz": "6698",
  "Calibrador de Sterak": "3053",
  "Filo de la noche": "3814",
  Malmortius: "3156",
  "Botas de rapidez": "3009",
  Rompecascos: "3181",
  "Fuerza de la naturaleza": "4401",
  "Corazon de hielo": "3110",
  "Hidra titanica": "3748",
  "Botas de mercurio": "3111",
  "Compañero de Luden": "6655",
  "Sombrero mortal de Rabadon": "3089",
  "Reloj de arena de Zhonya": "3157",
  "Baston del vacio": "3135",
  "Botas de hechicero": "3020",
  "Antorcha de fuego negro": "6657",
  Llamasombría: "4645",
  "Velo del hada de la muerte": "4644",
  "Botas jonias de la lucidez": "3158",
  "Baston de aguas fluyentes": "6616",
  "Filo infinito": "3031",
  "Huracan de Runaan": "3085",
  Sanguinaria: "3072",
  "Recuerdos de lord Dominik": "3036",
  "Grebas de berserker": "3006",
  "Hoja del rey arruinado": "3153",
  "Arcoescudo inmortal": "6673",
  Coleccionista: "6676",
  "Cimitarra mercurial": "3139",
  "Filo fantasmal de Youmuu": "3142",
  "Corazon de acero": "3084",
  "Jak'Sho el Proteico": "6665",
  "Rostro espiritual": "3065",
  "Presagio de Randuin": "3143",
  "Botas blindadas": "3047",
  "Armadura de Warmog": "3083",
  "Objeto de soporte": "3860",
  "Promesa del caballero": "3109",
  Redencion: "3107",
  "Convergencia de Zeke": "3050",
  Mikael: "3222",
  "Botas de movilidad": "3117",
  "Cancion de guerra de Shurelya": "2065",
  "Incensario ardiente": "3504",
  "Mandato imperial": "4005",
  "Espada larga": "1036",
  Oportunidad: "6701",
  Serylda: "6694",
  "Canon de fuego rapido": "3094",
  "Tormento de Liandry": "6653",
  "Velo de la noche": "3814",
};

const ROLE_BUILD_BY_ELO = {
  Fighter: {
    "Hierro-Bronce": {
      starting: ["Escudo de Doran", "Pocion de vida"],
      core: ["Cuchilla negra", "Baile de la muerte"],
      situational: ["Malla de espinas", "Angel guardian"],
      boots: ["Grebas de berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Hidra voraz", "Calibrador de Sterak"],
      situational: ["Filo de la noche", "Malmortius"],
      boots: ["Botas de rapidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Rompecascos", "Calibrador de Sterak"],
      situational: ["Fuerza de la naturaleza", "Corazon de hielo"],
      boots: ["Botas blindadas"],
    },
    "Diamante+": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Hidra titanica", "Baile de la muerte"],
      situational: ["Mawmortius", "Angel guardian"],
      boots: ["Botas de mercurio"],
    },
  },
  Mage: {
    "Hierro-Bronce": {
      starting: ["Anillo de Doran", "Pocion de vida"],
      core: ["Compañero de Luden", "Sombrero mortal de Rabadon"],
      situational: ["Reloj de arena de Zhonya", "Baston del vacio"],
      boots: ["Botas de hechicero"],
    },
    "Plata-Oro": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Antorcha de fuego negro", "Llamasombría"],
      situational: ["Velo del hada de la muerte", "Baston del vacio"],
      boots: ["Botas de hechicero"],
    },
    "Platino-Esmeralda": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Reloj de arena de Zhonya", "Velo del hada de la muerte"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Diamante+": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Baston de aguas fluyentes", "Sombrero mortal de Rabadon"],
      situational: ["Baston del vacio", "Reloj de arena de Zhonya"],
      boots: ["Botas jonias de la lucidez"],
    },
  },
  Marksman: {
    "Hierro-Bronce": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Filo infinito", "Huracan de Runaan"],
      situational: ["Sanguinaria", "Recuerdos de lord Dominik"],
      boots: ["Grebas de berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Hoja del rey arruinado", "Filo infinito"],
      situational: ["Arcoescudo inmortal", "Recuerdos de lord Dominik"],
      boots: ["Grebas de berserker"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Coleccionista", "Filo infinito"],
      situational: ["Cimitarra mercurial", "Sanguinaria"],
      boots: ["Grebas de berserker"],
    },
    "Diamante+": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Filo fantasmal de Youmuu", "Coleccionista"],
      situational: ["Recuerdos de lord Dominik", "Arcoescudo inmortal"],
      boots: ["Grebas de berserker"],
    },
  },
  Tank: {
    "Hierro-Bronce": {
      starting: ["Escudo de Doran", "Pocion de vida"],
      core: ["Malla de espinas", "Corazon de acero"],
      situational: ["Rostro espiritual", "Presagio de Randuin"],
      boots: ["Botas blindadas"],
    },
    "Plata-Oro": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Corazon de acero", "Jak'Sho el Proteico"],
      situational: ["Rostro espiritual", "Armadura de Warmog"],
      boots: ["Botas de mercurio"],
    },
    "Platino-Esmeralda": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Jak'Sho el Proteico", "Malla de espinas"],
      situational: ["Corazon de hielo", "Presagio de Randuin"],
      boots: ["Botas blindadas"],
    },
    "Diamante+": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Corazon de acero", "Corazon de hielo"],
      situational: ["Rostro espiritual", "Fuerza de la naturaleza"],
      boots: ["Botas de mercurio"],
    },
  },
  Support: {
    "Hierro-Bronce": {
      starting: ["Objeto de soporte", "Pocion de vida"],
      core: ["Promesa del caballero", "Redencion"],
      situational: ["Convergencia de Zeke", "Mikael"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Plata-Oro": {
      starting: ["Objeto de soporte", "Pocion de vida"],
      core: ["Cancion de guerra de Shurelya", "Redencion"],
      situational: ["Mikael", "Incensario ardiente"],
      boots: ["Botas de movilidad"],
    },
    "Platino-Esmeralda": {
      starting: ["Objeto de soporte", "Pocion reutilizable"],
      core: ["Mandato imperial", "Cancion de guerra de Shurelya"],
      situational: ["Redencion", "Mikael"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Diamante+": {
      starting: ["Objeto de soporte", "Pocion reutilizable"],
      core: ["Mandato imperial", "Promesa del caballero"],
      situational: ["Convergencia de Zeke", "Redencion"],
      boots: ["Botas de movilidad"],
    },
  },
  Assassin: {
    "Hierro-Bronce": {
      starting: ["Espada larga", "Pocion de vida"],
      core: ["Filo fantasmal de Youmuu", "Oportunidad"],
      situational: ["Filo de la noche", "Serylda"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Plata-Oro": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Oportunidad", "Coleccionista"],
      situational: ["Serylda", "Malmortius"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Filo fantasmal de Youmuu", "Serylda"],
      situational: ["Filo de la noche", "Angel guardian"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Diamante+": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Oportunidad", "Filo fantasmal de Youmuu"],
      situational: ["Serylda", "Angel guardian"],
      boots: ["Botas de rapidez"],
    },
  },
};

const DEFAULT_ELO_BUILD = ROLE_BUILD_BY_ELO.Fighter;

const CHAMPION_BUILD_OVERRIDES = {
  Ahri: {
    "Hierro-Bronce": {
      starting: ["Anillo de Doran", "Pocion de vida"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Reloj de arena de Zhonya", "Baston del vacio"],
      boots: ["Botas de hechicero"],
    },
    "Plata-Oro": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Compañero de Luden", "Sombrero mortal de Rabadon"],
      situational: ["Velo del hada de la muerte", "Reloj de arena de Zhonya"],
      boots: ["Botas de hechicero"],
    },
    "Platino-Esmeralda": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Baston del vacio", "Velo del hada de la muerte"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Diamante+": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Tormento de Liandry", "Sombrero mortal de Rabadon"],
      situational: ["Reloj de arena de Zhonya", "Baston del vacio"],
      boots: ["Botas jonias de la lucidez"],
    },
  },
  Yasuo: {
    "Hierro-Bronce": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Arcoescudo inmortal", "Filo infinito"],
      situational: ["Baile de la muerte", "Sanguinaria"],
      boots: ["Grebas de berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Hoja del rey arruinado", "Filo infinito"],
      situational: ["Calibrador de Sterak", "Sanguinaria"],
      boots: ["Grebas de berserker"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada de Doran", "Pocion reutilizable"],
      core: ["Hoja del rey arruinado", "Recuerdos de lord Dominik"],
      situational: ["Angel guardian", "Baile de la muerte"],
      boots: ["Grebas de berserker"],
    },
    "Diamante+": {
      starting: ["Espada de Doran", "Pocion reutilizable"],
      core: ["Hoja del rey arruinado", "Filo infinito"],
      situational: ["Velo de la noche", "Angel guardian"],
      boots: ["Grebas de berserker"],
    },
  },
  Zed: {
    "Hierro-Bronce": {
      starting: ["Espada larga", "Pocion de vida"],
      core: ["Filo fantasmal de Youmuu", "Oportunidad"],
      situational: ["Serylda", "Filo de la noche"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Plata-Oro": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Oportunidad", "Serylda"],
      situational: ["Filo de la noche", "Angel guardian"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Filo fantasmal de Youmuu", "Serylda"],
      situational: ["Oportunidad", "Malmortius"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Diamante+": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Oportunidad", "Filo de la noche"],
      situational: ["Serylda", "Angel guardian"],
      boots: ["Botas de rapidez"],
    },
  },
  Jinx: {
    "Hierro-Bronce": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Filo infinito", "Huracan de Runaan"],
      situational: ["Sanguinaria", "Recuerdos de lord Dominik"],
      boots: ["Grebas de berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Pocion de vida"],
      core: ["Filo infinito", "Canon de fuego rapido"],
      situational: ["Arcoescudo inmortal", "Recuerdos de lord Dominik"],
      boots: ["Grebas de berserker"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada de Doran", "Pocion reutilizable"],
      core: ["Filo infinito", "Coleccionista"],
      situational: ["Sanguinaria", "Cimitarra mercurial"],
      boots: ["Grebas de berserker"],
    },
    "Diamante+": {
      starting: ["Espada de Doran", "Pocion reutilizable"],
      core: ["Filo infinito", "Recuerdos de lord Dominik"],
      situational: ["Arcoescudo inmortal", "Sanguinaria"],
      boots: ["Grebas de berserker"],
    },
  },
  Lux: {
    "Hierro-Bronce": {
      starting: ["Anillo de Doran", "Pocion de vida"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Reloj de arena de Zhonya", "Baston del vacio"],
      boots: ["Botas de hechicero"],
    },
    "Plata-Oro": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Compañero de Luden", "Sombrero mortal de Rabadon"],
      situational: ["Baston del vacio", "Velo del hada de la muerte"],
      boots: ["Botas de hechicero"],
    },
    "Platino-Esmeralda": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Tormento de Liandry", "Llamasombría"],
      situational: ["Reloj de arena de Zhonya", "Baston del vacio"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Diamante+": {
      starting: ["Anillo de Doran", "Pocion reutilizable"],
      core: ["Compañero de Luden", "Sombrero mortal de Rabadon"],
      situational: ["Reloj de arena de Zhonya", "Velo del hada de la muerte"],
      boots: ["Botas jonias de la lucidez"],
    },
  },
  Garen: {
    "Hierro-Bronce": {
      starting: ["Escudo de Doran", "Pocion de vida"],
      core: ["Cuchilla negra", "Rompecascos"],
      situational: ["Malla de espinas", "Calibrador de Sterak"],
      boots: ["Botas blindadas"],
    },
    "Plata-Oro": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Cuchilla negra", "Baile de la muerte"],
      situational: ["Fuerza de la naturaleza", "Angel guardian"],
      boots: ["Botas de mercurio"],
    },
    "Platino-Esmeralda": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Rompecascos", "Calibrador de Sterak"],
      situational: ["Malla de espinas", "Baile de la muerte"],
      boots: ["Botas blindadas"],
    },
    "Diamante+": {
      starting: ["Escudo de Doran", "Pocion reutilizable"],
      core: ["Cuchilla negra", "Rompecascos"],
      situational: ["Corazon de hielo", "Fuerza de la naturaleza"],
      boots: ["Botas de mercurio"],
    },
  },
  LeeSin: {
    "Hierro-Bronce": {
      starting: ["Espada larga", "Pocion de vida"],
      core: ["Hidra voraz", "Cuchilla negra"],
      situational: ["Baile de la muerte", "Angel guardian"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Plata-Oro": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Cuchilla negra", "Calibrador de Sterak"],
      situational: ["Malmortius", "Angel guardian"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Hidra voraz", "Baile de la muerte"],
      situational: ["Corazon de hielo", "Calibrador de Sterak"],
      boots: ["Botas de rapidez"],
    },
    "Diamante+": {
      starting: ["Espada larga", "Pocion reutilizable"],
      core: ["Cuchilla negra", "Baile de la muerte"],
      situational: ["Angel guardian", "Malmortius"],
      boots: ["Botas jonias de la lucidez"],
    },
  },
  Thresh: {
    "Hierro-Bronce": {
      starting: ["Objeto de soporte", "Pocion de vida"],
      core: ["Promesa del caballero", "Convergencia de Zeke"],
      situational: ["Redencion", "Mikael"],
      boots: ["Botas de movilidad"],
    },
    "Plata-Oro": {
      starting: ["Objeto de soporte", "Pocion reutilizable"],
      core: ["Convergencia de Zeke", "Promesa del caballero"],
      situational: ["Redencion", "Presagio de Randuin"],
      boots: ["Botas jonias de la lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Objeto de soporte", "Pocion reutilizable"],
      core: ["Promesa del caballero", "Mandato imperial"],
      situational: ["Convergencia de Zeke", "Mikael"],
      boots: ["Botas de movilidad"],
    },
    "Diamante+": {
      starting: ["Objeto de soporte", "Pocion reutilizable"],
      core: ["Convergencia de Zeke", "Promesa del caballero"],
      situational: ["Redencion", "Malla de espinas"],
      boots: ["Botas jonias de la lucidez"],
    },
  },
};

const normalizeChampion = (champion, version) => ({
  id: champion.id,
  key: champion.key,
  name: champion.name,
  title: champion.title,
  tags: champion.tags,
  blurb: champion.blurb,
  image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
});

const getRoleBuild = (tags = []) => {
  const role = tags.find((tag) => ROLE_BUILD_BY_ELO[tag]);
  return ROLE_BUILD_BY_ELO[role] || DEFAULT_ELO_BUILD;
};

const getChampionSpecificBuild = (champion) => {
  const override = CHAMPION_BUILD_OVERRIDES[champion.id];
  if (override) return override;
  return getRoleBuild(champion.tags);
};

const toBuildItems = (names = []) =>
  names.map((name) => {
    const itemId = ITEM_ID_BY_NAME[name] || UNKNOWN_ITEM_ID;
    return {
      name,
      id: itemId,
      image: `https://ddragon.leagueoflegends.com/cdn/${activeVersion}/img/item/${itemId}.png`,
    };
  });

const withItemImages = (buildByElo) =>
  Object.fromEntries(
    Object.entries(buildByElo).map(([elo, build]) => [
      elo,
      {
        starting: toBuildItems(build.starting),
        core: toBuildItems(build.core),
        situational: toBuildItems(build.situational),
        boots: toBuildItems(build.boots),
      },
    ]),
  );

export const getChampionsData = async () => {
  const now = Date.now();
  if (championsCache && now - lastFetchAt < CACHE_TTL_MS) {
    return championsCache;
  }

  let payload;
  let versionToUse = activeVersion;

  const primaryResponse = await fetch(DDRAGON_CHAMPIONS_URL);
  if (primaryResponse.ok) {
    payload = await primaryResponse.json();
    versionToUse = "14.x.1";
  } else {
    const versionsResponse = await fetch(DDRAGON_VERSIONS_URL);
    if (!versionsResponse.ok) {
      throw new Error("No se pudo consultar Data Dragon");
    }

    const versions = await versionsResponse.json();
    const latestVersion = versions?.[0];
    if (!latestVersion) {
      throw new Error("No se obtuvo una version valida de Data Dragon");
    }

    const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/es_ES/champion.json`;
    const fallbackResponse = await fetch(fallbackUrl);
    if (!fallbackResponse.ok) {
      throw new Error("No se pudo consultar Data Dragon");
    }

    payload = await fallbackResponse.json();
    versionToUse = latestVersion;
  }

  activeVersion = versionToUse;
  const champions = Object.values(payload.data).map((champion) =>
    normalizeChampion(champion, versionToUse),
  );
  champions.sort((a, b) => a.name.localeCompare(b.name, "es"));

  championsCache = champions;
  lastFetchAt = now;
  return champions;
};

export const searchChampions = async (search = "") => {
  const champions = await getChampionsData();
  const term = search.trim().toLowerCase();

  if (!term) {
    return champions;
  }

  return champions.filter((champion) => {
    const haystack = `${champion.name} ${champion.title} ${champion.tags.join(" ")}`.toLowerCase();
    return haystack.includes(term);
  });
};

export const findChampionById = async (id) => {
  const champions = await getChampionsData();
  const champion = champions.find(
    (item) => item.id.toLowerCase() === id.toLowerCase(),
  );

  if (!champion) return null;

  return {
    ...champion,
    buildByElo: withItemImages(getChampionSpecificBuild(champion)),
  };
};
