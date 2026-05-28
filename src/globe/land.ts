import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landData from "world-atlas/land-110m.json";
import { latLngToVec3 } from "./utils";

type Ring = [number, number][];

export function buildLandGeometry(): THREE.BufferGeometry {
  const topo = landData as unknown as Topology<{ land: GeometryCollection }>;
  const collection = feature(topo, topo.objects.land);
  const features = "features" in collection ? collection.features : [collection];

  const positions: number[] = [];
  const emitRing = (ring: Ring) => {
    for (let i = 0; i < ring.length - 1; i++) {
      const [lngA, latA] = ring[i];
      const [lngB, latB] = ring[i + 1];
      const a = latLngToVec3(latA, lngA, 1.006);
      const b = latLngToVec3(latB, lngB, 1.006);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  };

  for (const f of features) {
    const g = f.geometry;
    if (g.type === "MultiPolygon") {
      for (const polygon of g.coordinates) {
        for (const ring of polygon) emitRing(ring as Ring);
      }
    } else if (g.type === "Polygon") {
      for (const ring of g.coordinates) emitRing(ring as Ring);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}
