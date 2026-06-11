import { getNearestOnProject } from './projectGpsPoints';

/**
 * โครงการเดียว แต่มีได้หลายจุด GPS — ใช้ระยะไปจุดที่ใกล้ที่สุด
 */
const CalculateGpsByProject = (coords, project, maxDistance = 100) => {
  const currentLat = coords?.latitude;
  const currentLon = coords?.longitude;

  const { distance, nearestPoint, isNearby } = getNearestOnProject(
    currentLat,
    currentLon,
    project,
    maxDistance,
  );

  const d = distance;

  return {
    currentLocation: {
      lat: currentLat,
      lon: currentLon,
    },
    nearestProject: {
      project,
      distance: d,
      isNearby,
      nearestSite: nearestPoint
        ? {
            name: nearestPoint.name,
            lat: nearestPoint.lat,
            lon: nearestPoint.lon,
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

export default CalculateGpsByProject;
