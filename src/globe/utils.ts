import * as THREE from "three";

export function latLngToVec3(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    -radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function solarDeclinationDeg(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
}

export function subsolarLngDeg(date: Date): number {
  const h = date.getUTCHours() + date.getUTCMinutes() / 60;
  let lng = -15 * (h - 12);
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

export function sunDirection(date: Date, distance = 10): THREE.Vector3 {
  return latLngToVec3(solarDeclinationDeg(date), subsolarLngDeg(date), distance);
}
