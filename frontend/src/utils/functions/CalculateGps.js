import {
  getNearestOnProject,
} from './projectGpsPoints';

/**
 * คำนวณระยะจากตำแหน่งพนักงานไปยังโครงการที่ใกล้ที่สุด
 * แต่ละโครงการอาจมีหลายจุด (gps + gps_sites) — ใช้ระยะไปจุดที่ใกล้ที่สุดในโครงการนั้น
 */
const CalculateGps = (coords, projects, maxDistance = 100) => {
  const projectArray = Array.isArray(projects) ? projects : [projects];

  const currentLat = coords?.latitude;
  const currentLon = coords?.longitude;

  const projectsWithDistance = projectArray.map((project) => {
    const { distance, nearestPoint, isNearby } = getNearestOnProject(
      currentLat,
      currentLon,
      project,
      maxDistance,
    );

    return {
      project,
      distance,
      isNearby,
      nearestPoint,
    };
  });

  projectsWithDistance.sort((a, b) => a.distance - b.distance);

  const nearest = projectsWithDistance[0];
  const d = nearest?.distance;

  return {
    currentLocation: {
      lat: currentLat,
      lon: currentLon,
    },
    nearestProject: {
      project: nearest?.project,
      distance: d,
      isNearby: nearest?.isNearby,
      nearestSite: nearest?.nearestPoint
        ? {
            name: nearest.nearestPoint.name,
            lat: nearest.nearestPoint.lat,
            lon: nearest.nearestPoint.lon,
          }
        : undefined,
      distanceText:
        d != null && d < Infinity && d < 1000
          ? `${Math.round(d)} เมตร`
          : d != null && d < Infinity
            ? `${(d / 1000).toFixed(2)} กิโลเมตร`
            : '-',
    },
  };
};

export default CalculateGps;
