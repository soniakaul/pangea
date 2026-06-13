// Type shims for untyped deps used by the any-city search.

declare module "tz-lookup" {
  /** Maps a latitude/longitude to an IANA timezone (e.g. "Europe/Amsterdam"). */
  export default function tzlookup(lat: number, lon: number): string;
}

declare module "pbf" {
  export default class Pbf {
    constructor(buf: Uint8Array | ArrayBuffer);
    pos: number;
    length: number;
    readMessage<T>(fn: (tag: number, obj: T, pbf: Pbf) => void, obj: T): T;
    readString(): string;
    readVarint(): number;
    readSVarint(): number;
  }
}

declare module "all-the-cities/cities.pbf?url" {
  const url: string;
  export default url;
}
