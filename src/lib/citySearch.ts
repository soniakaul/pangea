import Pbf from "pbf";
import citiesPbfUrl from "all-the-cities/cities.pbf?url";
import tzlookup from "tz-lookup";

// Any-city search, fully client-side. The `all-the-cities` package ships a
// ~6MB protobuf of ~135k cities, but its Node loader uses `fs` and can't run in
// the browser — so we fetch the .pbf as a static asset and decode it here with
// the browser-safe `pbf` reader, then resolve each result's IANA timezone from
// its coordinates via tz-lookup. No API, no key, works offline once loaded.

export type CityResult = {
  name: string;
  country: string; // display name, e.g. "Netherlands"
  countryCode: string; // ISO 3166-1 alpha-2
  admin?: string; // readable region/state code (e.g. "TX"), when available
  timezone: string; // IANA, e.g. "Europe/Amsterdam"
  lat: number;
  lng: number;
};

type RawCity = {
  name: string;
  country: string; // ISO2
  adminCode: string; // geonames admin1 code — alpha (e.g. "TX") for US/CA, numeric elsewhere
  population: number;
  lat: number;
  lng: number;
};

let citiesPromise: Promise<RawCity[]> | null = null;

// Mirrors all-the-cities' own field tags. Coordinates are delta-encoded across
// the whole stream, so we must decode sequentially and carry the running totals.
function decodePbf(buf: ArrayBuffer): RawCity[] {
  const pbf = new Pbf(new Uint8Array(buf));
  const cities: RawCity[] = [];
  let lastLat = 0;
  let lastLon = 0;
  const read = (tag: number, city: RawCity, p: Pbf) => {
    if (tag === 1) p.readSVarint();
    else if (tag === 2) city.name = p.readString();
    else if (tag === 3) city.country = p.readString();
    else if (tag === 4) p.readString();
    else if (tag === 5) p.readString();
    else if (tag === 6) p.readString();
    else if (tag === 7) p.readString();
    else if (tag === 8) city.adminCode = p.readString();
    else if (tag === 9) city.population = p.readVarint();
    else if (tag === 10) {
      lastLon += p.readSVarint();
      city.lng = lastLon / 1e5;
    } else if (tag === 11) {
      lastLat += p.readSVarint();
      city.lat = lastLat / 1e5;
    }
  };
  while (pbf.pos < pbf.length) {
    cities.push(
      pbf.readMessage(read, {
        name: "",
        country: "",
        adminCode: "",
        population: 0,
        lat: 0,
        lng: 0,
      }),
    );
  }
  return cities;
}

/** Loads + decodes the city dataset once, caching the promise. */
export function loadCities(): Promise<RawCity[]> {
  if (!citiesPromise) {
    citiesPromise = fetch(citiesPbfUrl)
      .then((r) => r.arrayBuffer())
      .then(decodePbf)
      .catch((e) => {
        citiesPromise = null; // allow a retry on the next keystroke
        throw e;
      });
  }
  return citiesPromise;
}

let regionNames: Intl.DisplayNames | null = null;
function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function toResult(c: RawCity): CityResult {
  let timezone = "UTC";
  try {
    timezone = tzlookup(c.lat, c.lng);
  } catch {
    /* keep UTC fallback */
  }
  // Alpha admin codes (US/CA states/provinces, e.g. "TX") are human-readable;
  // numeric codes elsewhere are noise, so drop them.
  const admin = /^[A-Za-z]{2,3}$/.test(c.adminCode) ? c.adminCode.toUpperCase() : undefined;
  return {
    name: c.name,
    country: countryName(c.country),
    countryCode: c.country,
    admin,
    timezone,
    lat: c.lat,
    lng: c.lng,
  };
}

/**
 * Ranks matches: exact name, then prefix, then word-boundary, then any
 * substring — breaking ties by population so the major city wins.
 */
export async function searchCities(query: string, limit = 8): Promise<CityResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const cities = await loadCities();
  const scored: { c: RawCity; score: number }[] = [];
  for (const c of cities) {
    const name = c.name.toLowerCase();
    const idx = name.indexOf(q);
    if (idx === -1) continue;
    let score: number;
    if (name === q) score = 0;
    else if (idx === 0) score = 1;
    else if (name[idx - 1] === " ") score = 2;
    else score = 3;
    scored.push({ c, score });
  }
  scored.sort((a, b) => a.score - b.score || b.c.population - a.c.population);
  return scored.slice(0, limit).map(({ c }) => toResult(c));
}
