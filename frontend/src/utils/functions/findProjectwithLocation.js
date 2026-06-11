import _ from 'lodash';
import { getNearestOnProject } from './projectGpsPoints';

/**
 * โครงการที่อยู่ภายในรัศมี — ถ้าโครงการมีหลายจุด ถือว่าอยู่ในรัศมีถ้าอยู่ใกล้จุดใดจุดหนึ่ง
 */
function findProjectwithLocation(coords, projects, radius = 100) {
  const list = [];
  _.map(projects?.rows, (item) => {
    const { distance, nearestPoint } = getNearestOnProject(
      coords?.latitude,
      coords?.longitude,
      item,
      radius,
    );
    if (distance <= radius && nearestPoint) {
      list.push({ item, distance, nearestPoint });
    }
  });
  return list;
}

export default findProjectwithLocation;
