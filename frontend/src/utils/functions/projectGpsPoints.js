/**
 * รวมจุด GPS ของโครงการ: จุดหลัก (gps) + ไซต์เพิ่ม (gps_sites)
 * ใช้ร่วมกับการคำนวณระยะลงเวลา
 */

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    Number.isNaN(lat1) ||
    Number.isNaN(lon1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lon2)
  ) {
    return Infinity;
  }

  const toRadian = (degree) => (degree * Math.PI) / 180;
  const R = 6371000;
  const φ1 = toRadian(lat1);
  const φ2 = toRadian(lat2);
  const Δφ = toRadian(lat2 - lat1);
  const Δλ = toRadian(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * @returns {{ name: string, lat: number, lon: number, source: 'primary'|'site' }[]}
 */
export function getProjectGpsPoints(project) {
  if (!project) return [];
  const points = [];
  if (project.gps?.lat != null && project.gps?.lon != null) {
    points.push({
      name: 'จุดหลัก',
      lat: Number(project.gps.lat),
      lon: Number(project.gps.lon),
      source: 'primary',
    });
  }
  const sites = Array.isArray(project.gps_sites) ? project.gps_sites : [];
  sites.forEach((s, i) => {
    if (s?.lat != null && s?.lon != null) {
      const label =
        (s.name && String(s.name).trim()) || `ไซต์ ${i + 1}`;
      points.push({
        name: label,
        lat: Number(s.lat),
        lon: Number(s.lon),
        source: 'site',
      });
    }
  });
  return points;
}

export function countProjectGpsPoints(project) {
  return getProjectGpsPoints(project).length;
}

/**
 * @returns {{ distance: number, nearestPoint: object|null, isNearby: boolean }}
 */
export function getNearestOnProject(currentLat, currentLon, project, maxDistance) {
  const pts = getProjectGpsPoints(project);
  if (!pts.length) {
    return {
      distance: Infinity,
      nearestPoint: null,
      isNearby: false,
    };
  }
  let best = null;
  let bestD = Infinity;
  pts.forEach((p) => {
    const d = calculateDistance(currentLat, currentLon, p.lat, p.lon);
    if (d < bestD) {
      bestD = d;
      best = { ...p, distance: d };
    }
  });
  return {
    distance: bestD,
    nearestPoint: best,
    isNearby: bestD <= maxDistance,
  };
}
