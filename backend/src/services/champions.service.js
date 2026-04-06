const DDRAGON_CHAMPIONS_URL =
  "https://ddragon.leagueoflegends.com/cdn/14.x.1/data/es_ES/champion.json";
const DDRAGON_VERSIONS_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";

const CACHE_TTL_MS = 10 * 60 * 1000;

let championsCache = null;
let lastFetchAt = 0;
let activeVersion = "14.x.1";
const UNKNOWN_ITEM_ID = "7050";
const customChampions = [];
const customBuildOverrides = {}; // championId -> elo -> build

const getAllChampions = async () => {
  const champions = await getChampionsData();
  return [...champions, ...customChampions];
};

const getCustomBuilds = (championId) => {
  return customBuildOverrides[championId] || {};
};

const computeChampionBuilds = (champion) => {
  const defaultBuild = CHAMPION_BUILD_OVERRIDES[champion.id] || getRoleBuild(champion.tags);
  const customBuild = getCustomBuilds(champion.id);
  return { ...defaultBuild, ...customBuild };
};

const buildChampionDetail = (champion) => ({
  ...champion,
  buildByElo: withItemImages(computeChampionBuilds(champion)),
});

const ITEM_ID_BY_NAME = {
  "Escudo de Doran": "1054",
  "Poción de Vida": "2003",
  "Poción Reutilizable": "2031",
  "Espada de Doran": "1055",
  "Anillo de Doran": "1056",
  "Cuchilla Negra": "3071",
  "Baile de la Muerte": "6333",
  "Malla de Espinas": "3075",
  "Ángel Guardián": "3026",
  "Hidra Voraz": "6698",
  "Calibrador de Sterak": "3053",
  "Filo de la Noche": "3814",
  "Malmortius": "3156",
  "Botas de Rapidez": "3009",
  "Rompecascos": "3181",
  "Fuerza de la Naturaleza": "4401",
  "Corazón de Hielo": "3110",
  "Hidra Titánica": "3748",
  "Botas de Mercurio": "3111",
  "Compañero de Luden": "6655",
  "Sombrero Mortal de Rabadon": "3089",
  "Reloj de Arena de Zhonya": "3157",
  "Bastón del Vacío": "3135",
  "Botas de Hechicero": "3020",
  "Antorcha de Fuego Negro": "6657",
  "Llamasombría": "4645",
  "Velo del Hada de la Muerte": "4644",
  "Botas Jonias de la Lucidez": "3158",
  "Bastón de Aguas Fluyentes": "6616",
  "Filo Infinito": "3031",
  "Huracán de Runaan": "3085",
  "Sanguinaria": "3072",
  "Recuerdos de Lord Dominik": "3036",
  "Grebas de Berserker": "3006",
  "Hoja del Rey Arruinado": "3153",
  "Arcoescudo Inmortal": "6673",
  "Coleccionista": "6676",
  "Cimitarra Mercurial": "3139",
  "Filo Fantasmal de Youmuu": "3142",
  "Corazón de Acero": "3084",
  "Jak'Sho el Proteico": "6665",
  "Rostro Espiritual": "3065",
  "Presagio de Randuin": "3143",
  "Botas Blindadas": "3047",
  "Armadura de Warmog": "3083",
  "Objeto de Soporte": "3860",
  "Promesa del Caballero": "3109",
  "Redención": "3107",
  "Convergencia de Zeke": "3050",
  "Mikael": "3222",
  "Botas de Movilidad": "3117",
  "Canción de Guerra de Shurelya": "2065",
  "Incensario Ardiente": "3504",
  "Mandato Imperial": "4005",
  "Espada Larga": "1036",
  "Oportunidad": "6701",
  "Serylda": "6694",
  "Cañón de Fuego Rápido": "3094",
  "Tormento de Liandry": "6653",
  "Velo de la Noche": "3814",
};

const ROLE_BUILD_BY_ELO = {
  Fighter: {
    "Hierro-Bronce": {
      starting: ["Escudo de Doran", "Poción de Vida"],
      core: ["Cuchilla Negra", "Baile de la Muerte"],
      situational: ["Malla de Espinas", "Ángel Guardián"],
      boots: ["Grebas de Berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Hidra Voraz", "Calibrador de Sterak"],
      situational: ["Filo de la Noche", "Malmortius"],
      boots: ["Botas de Rapidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Rompecascos", "Calibrador de Sterak"],
      situational: ["Fuerza de la Naturaleza", "Corazón de Hielo"],
      boots: ["Botas Blindadas"],
    },
    "Diamante+": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Hidra Titánica", "Baile de la Muerte"],
      situational: ["Malmortius", "Ángel Guardián"],
      boots: ["Botas de Mercurio"],
    },
  },
  Mage: {
    "Hierro-Bronce": {
      starting: ["Anillo de Doran", "Poción de Vida"],
      core: ["Compañero de Luden", "Sombrero Mortal de Rabadon"],
      situational: ["Reloj de Arena de Zhonya", "Bastón del Vacío"],
      boots: ["Botas de Hechicero"],
    },
    "Plata-Oro": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Antorcha de Fuego Negro", "Llamasombría"],
      situational: ["Velo del Hada de la Muerte", "Bastón del Vacío"],
      boots: ["Botas de Hechicero"],
    },
    "Platino-Esmeralda": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Reloj de Arena de Zhonya", "Velo del Hada de la Muerte"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Diamante+": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Bastón de Aguas Fluyentes", "Sombrero Mortal de Rabadon"],
      situational: ["Bastón del Vacío", "Reloj de Arena de Zhonya"],
      boots: ["Botas Jonias de la Lucidez"],
    },
  },
  Marksman: {
    "Hierro-Bronce": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Filo Infinito", "Huracán de Runaan"],
      situational: ["Sanguinaria", "Recuerdos de Lord Dominik"],
      boots: ["Grebas de Berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Hoja del Rey Arruinado", "Filo Infinito"],
      situational: ["Arcoescudo Inmortal", "Recuerdos de Lord Dominik"],
      boots: ["Grebas de Berserker"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Coleccionista", "Filo Infinito"],
      situational: ["Cimitarra Mercurial", "Sanguinaria"],
      boots: ["Grebas de Berserker"],
    },
    "Diamante+": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Filo Fantasmal de Youmuu", "Coleccionista"],
      situational: ["Recuerdos de Lord Dominik", "Arcoescudo Inmortal"],
      boots: ["Grebas de Berserker"],
    },
  },
  Tank: {
    "Hierro-Bronce": {
      starting: ["Escudo de Doran", "Poción de Vida"],
      core: ["Malla de Espinas", "Corazón de Acero"],
      situational: ["Rostro Espiritual", "Presagio de Randuin"],
      boots: ["Botas Blindadas"],
    },
    "Plata-Oro": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Corazón de Acero", "Jak'Sho el Proteico"],
      situational: ["Rostro Espiritual", "Armadura de Warmog"],
      boots: ["Botas de Mercurio"],
    },
    "Platino-Esmeralda": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Jak'Sho el Proteico", "Malla de Espinas"],
      situational: ["Corazón de Hielo", "Presagio de Randuin"],
      boots: ["Botas Blindadas"],
    },
    "Diamante+": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Corazón de Acero", "Corazón de Hielo"],
      situational: ["Rostro Espiritual", "Fuerza de la Naturaleza"],
      boots: ["Botas de Mercurio"],
    },
  },
  Support: {
    "Hierro-Bronce": {
      starting: ["Objeto de Soporte", "Poción de Vida"],
      core: ["Promesa del Caballero", "Redención"],
      situational: ["Convergencia de Zeke", "Mikael"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Plata-Oro": {
      starting: ["Objeto de Soporte", "Poción de Vida"],
      core: ["Canción de Guerra de Shurelya", "Redención"],
      situational: ["Mikael", "Incensario Ardiente"],
      boots: ["Botas de Movilidad"],
    },
    "Platino-Esmeralda": {
      starting: ["Objeto de Soporte", "Poción Reutilizable"],
      core: ["Mandato Imperial", "Canción de Guerra de Shurelya"],
      situational: ["Redención", "Mikael"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Diamante+": {
      starting: ["Objeto de Soporte", "Poción Reutilizable"],
      core: ["Mandato Imperial", "Promesa del Caballero"],
      situational: ["Convergencia de Zeke", "Redención"],
      boots: ["Botas de Movilidad"],
    },
  },
  Assassin: {
    "Hierro-Bronce": {
      starting: ["Espada Larga", "Poción de Vida"],
      core: ["Filo Fantasmal de Youmuu", "Oportunidad"],
      situational: ["Filo de la Noche", "Serylda"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Plata-Oro": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Oportunidad", "Coleccionista"],
      situational: ["Serylda", "Malmortius"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Filo Fantasmal de Youmuu", "Serylda"],
      situational: ["Filo de la Noche", "Ángel Guardián"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Diamante+": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Oportunidad", "Filo Fantasmal de Youmuu"],
      situational: ["Serylda", "Ángel Guardián"],
      boots: ["Botas de Rapidez"],
    },
  },
};

const DEFAULT_ELO_BUILD = ROLE_BUILD_BY_ELO.Fighter;

const CHAMPION_BUILD_OVERRIDES = {
  Ahri: {
    "Hierro-Bronce": {
      starting: ["Anillo de Doran", "Poción de Vida"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Reloj de Arena de Zhonya", "Bastón del Vacío"],
      boots: ["Botas de Hechicero"],
    },
    "Plata-Oro": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Compañero de Luden", "Sombrero Mortal de Rabadon"],
      situational: ["Velo del Hada de la Muerte", "Reloj de Arena de Zhonya"],
      boots: ["Botas de Hechicero"],
    },
    "Platino-Esmeralda": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Bastón del Vacío", "Velo del Hada de la Muerte"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Diamante+": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Tormento de Liandry", "Sombrero Mortal de Rabadon"],
      situational: ["Reloj de Arena de Zhonya", "Bastón del Vacío"],
      boots: ["Botas Jonias de la Lucidez"],
    },
  },
  Yasuo: {
    "Hierro-Bronce": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Arcoescudo Inmortal", "Filo Infinito"],
      situational: ["Baile de la Muerte", "Sanguinaria"],
      boots: ["Grebas de Berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Hoja del Rey Arruinado", "Filo Infinito"],
      situational: ["Calibrador de Sterak", "Sanguinaria"],
      boots: ["Grebas de Berserker"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada de Doran", "Poción Reutilizable"],
      core: ["Hoja del Rey Arruinado", "Recuerdos de Lord Dominik"],
      situational: ["Ángel Guardián", "Baile de la Muerte"],
      boots: ["Grebas de Berserker"],
    },
    "Diamante+": {
      starting: ["Espada de Doran", "Poción Reutilizable"],
      core: ["Hoja del Rey Arruinado", "Filo Infinito"],
      situational: ["Velo de la Noche", "Ángel Guardián"],
      boots: ["Grebas de Berserker"],
    },
  },
  Zed: {
    "Hierro-Bronce": {
      starting: ["Espada Larga", "Poción de Vida"],
      core: ["Filo Fantasmal de Youmuu", "Oportunidad"],
      situational: ["Serylda", "Filo de la Noche"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Plata-Oro": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Oportunidad", "Serylda"],
      situational: ["Filo de la Noche", "Ángel Guardián"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Filo Fantasmal de Youmuu", "Serylda"],
      situational: ["Oportunidad", "Malmortius"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Diamante+": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Oportunidad", "Filo de la Noche"],
      situational: ["Serylda", "Ángel Guardián"],
      boots: ["Botas de Rapidez"],
    },
  },
  Jinx: {
    "Hierro-Bronce": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Filo Infinito", "Huracán de Runaan"],
      situational: ["Sanguinaria", "Recuerdos de Lord Dominik"],
      boots: ["Grebas de Berserker"],
    },
    "Plata-Oro": {
      starting: ["Espada de Doran", "Poción de Vida"],
      core: ["Filo Infinito", "Cañón de Fuego Rápido"],
      situational: ["Arcoescudo Inmortal", "Recuerdos de Lord Dominik"],
      boots: ["Grebas de Berserker"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada de Doran", "Poción Reutilizable"],
      core: ["Filo Infinito", "Coleccionista"],
      situational: ["Sanguinaria", "Cimitarra Mercurial"],
      boots: ["Grebas de Berserker"],
    },
    "Diamante+": {
      starting: ["Espada de Doran", "Poción Reutilizable"],
      core: ["Filo Infinito", "Recuerdos de Lord Dominik"],
      situational: ["Arcoescudo Inmortal", "Sanguinaria"],
      boots: ["Grebas de Berserker"],
    },
  },
  Lux: {
    "Hierro-Bronce": {
      starting: ["Anillo de Doran", "Poción de Vida"],
      core: ["Compañero de Luden", "Llamasombría"],
      situational: ["Reloj de Arena de Zhonya", "Bastón del Vacío"],
      boots: ["Botas de Hechicero"],
    },
    "Plata-Oro": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Compañero de Luden", "Sombrero Mortal de Rabadon"],
      situational: ["Bastón del Vacío", "Velo del Hada de la Muerte"],
      boots: ["Botas de Hechicero"],
    },
    "Platino-Esmeralda": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Tormento de Liandry", "Llamasombría"],
      situational: ["Reloj de Arena de Zhonya", "Bastón del Vacío"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Diamante+": {
      starting: ["Anillo de Doran", "Poción Reutilizable"],
      core: ["Compañero de Luden", "Sombrero Mortal de Rabadon"],
      situational: ["Reloj de Arena de Zhonya", "Velo del Hada de la Muerte"],
      boots: ["Botas Jonias de la Lucidez"],
    },
  },
  Garen: {
    "Hierro-Bronce": {
      starting: ["Escudo de Doran", "Poción de Vida"],
      core: ["Cuchilla Negra", "Rompecascos"],
      situational: ["Malla de Espinas", "Calibrador de Sterak"],
      boots: ["Botas Blindadas"],
    },
    "Plata-Oro": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Cuchilla Negra", "Baile de la Muerte"],
      situational: ["Fuerza de la Naturaleza", "Ángel Guardián"],
      boots: ["Botas de Mercurio"],
    },
    "Platino-Esmeralda": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Rompecascos", "Calibrador de Sterak"],
      situational: ["Malla de Espinas", "Baile de la Muerte"],
      boots: ["Botas Blindadas"],
    },
    "Diamante+": {
      starting: ["Escudo de Doran", "Poción Reutilizable"],
      core: ["Cuchilla Negra", "Rompecascos"],
      situational: ["Corazón de Hielo", "Fuerza de la Naturaleza"],
      boots: ["Botas de Mercurio"],
    },
  },
  LeeSin: {
    "Hierro-Bronce": {
      starting: ["Espada Larga", "Poción de Vida"],
      core: ["Hidra Voraz", "Cuchilla Negra"],
      situational: ["Baile de la Muerte", "Ángel Guardián"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Plata-Oro": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Cuchilla Negra", "Calibrador de Sterak"],
      situational: ["Malmortius", "Ángel Guardián"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Hidra Voraz", "Baile de la Muerte"],
      situational: ["Corazón de Hielo", "Calibrador de Sterak"],
      boots: ["Botas de Rapidez"],
    },
    "Diamante+": {
      starting: ["Espada Larga", "Poción Reutilizable"],
      core: ["Cuchilla Negra", "Baile de la Muerte"],
      situational: ["Ángel Guardián", "Malmortius"],
      boots: ["Botas Jonias de la Lucidez"],
    },
  },
  Thresh: {
    "Hierro-Bronce": {
      starting: ["Objeto de Soporte", "Poción de Vida"],
      core: ["Promesa del Caballero", "Convergencia de Zeke"],
      situational: ["Redención", "Mikael"],
      boots: ["Botas de Movilidad"],
    },
    "Plata-Oro": {
      starting: ["Objeto de Soporte", "Poción Reutilizable"],
      core: ["Convergencia de Zeke", "Promesa del Caballero"],
      situational: ["Redención", "Presagio de Randuin"],
      boots: ["Botas Jonias de la Lucidez"],
    },
    "Platino-Esmeralda": {
      starting: ["Objeto de Soporte", "Poción Reutilizable"],
      core: ["Promesa del Caballero", "Mandato Imperial"],
      situational: ["Convergencia de Zeke", "Mikael"],
      boots: ["Botas de Movilidad"],
    },
    "Diamante+": {
      starting: ["Objeto de Soporte", "Poción Reutilizable"],
      core: ["Convergencia de Zeke", "Promesa del Caballero"],
      situational: ["Redención", "Malla de Espinas"],
      boots: ["Botas Jonias de la Lucidez"],
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
  const champions = await getAllChampions();
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
  const champions = await getAllChampions();
  const champion = champions.find(
    (item) => item.id.toLowerCase() === id.toLowerCase(),
  );

  if (!champion) return null;

  return buildChampionDetail(champion);
};

export const getChampionBuilds = async (id) => {
  const champions = await getAllChampions();
  const champion = champions.find(
    (item) => item.id.toLowerCase() === id.toLowerCase(),
  );
  if (!champion) return null;

  return getCustomBuilds(champion.id);
};

export const createChampionBuild = async (championId, buildData) => {
  const champions = await getAllChampions();
  const champion = champions.find(
    (item) => item.id.toLowerCase() === championId.toLowerCase(),
  );
  if (!champion) {
    throw new Error("Campeon no encontrado");
  }

  const { elo, starting, core, situational, boots } = buildData;
  if (!elo || !Array.isArray(starting) || !Array.isArray(core) || !Array.isArray(situational) || !Array.isArray(boots)) {
    throw new Error("Los campos elo, starting, core, situational y boots son obligatorios");
  }

  const championKey = champion.id;
  const championBuilds = customBuildOverrides[championKey] || {};
  if (championBuilds[elo]) {
    throw new Error("Ya existe un build custom para ese elo");
  }

  customBuildOverrides[championKey] = {
    ...championBuilds,
    [elo]: { starting, core, situational, boots },
  };

  return customBuildOverrides[championKey][elo];
};

export const updateChampionBuild = async (championId, elo, buildData) => {
  const championKey = championId.toString();
  if (!customBuildOverrides[championKey] || !customBuildOverrides[championKey][elo]) {
    return null;
  }

  const { starting, core, situational, boots } = buildData;
  if (!Array.isArray(starting) || !Array.isArray(core) || !Array.isArray(situational) || !Array.isArray(boots)) {
    throw new Error("Los campos starting, core, situational y boots son obligatorios");
  }

  customBuildOverrides[championKey][elo] = { starting, core, situational, boots };
  return customBuildOverrides[championKey][elo];
};

export const deleteChampionBuild = async (championId, elo) => {
  const championKey = championId.toString();
  if (!customBuildOverrides[championKey] || !customBuildOverrides[championKey][elo]) {
    return false;
  }

  delete customBuildOverrides[championKey][elo];
  if (Object.keys(customBuildOverrides[championKey]).length === 0) {
    delete customBuildOverrides[championKey];
  }

  return true;
};

export const createChampion = async (championData) => {
  const { id, name, title, tags = [], blurb = "", image = "" } = championData;

  if (!name || !title || !Array.isArray(tags) || !image) {
    throw new Error("Los campos name, title, tags e image son obligatorios");
  }

  const championId = id?.toString().trim() || `custom-${Date.now()}`;
  const existing = await findChampionById(championId);
  if (existing) {
    throw new Error("Ya existe un campeon con ese id");
  }

  const newChampion = {
    id: championId,
    key: championId,
    name,
    title,
    tags,
    blurb,
    image,
  };

  customChampions.push(newChampion);
  return newChampion;
};

export const updateChampion = async (id, championData) => {
  const index = customChampions.findIndex(
    (item) => item.id.toLowerCase() === id.toLowerCase(),
  );
  if (index === -1) return null;

  const existingChampion = customChampions[index];
  const updatedChampion = {
    ...existingChampion,
    ...championData,
    id: existingChampion.id,
    key: existingChampion.id,
  };

  customChampions[index] = updatedChampion;
  return updatedChampion;
};

export const deleteChampion = async (id) => {
  const index = customChampions.findIndex(
    (item) => item.id.toLowerCase() === id.toLowerCase(),
  );
  if (index === -1) return false;

  customChampions.splice(index, 1);
  return true;
};
