import React from 'react';
import dayjs from 'dayjs';

export default function CalOthour(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  let start = dayjs(startTime);
  let end = dayjs(endTime);

  // If end is before start, assume work passed midnight — add one day to end
  if (end.isBefore(start)) {
    end = end.add(1, 'day');
  }

  const hours = end.diff(start, 'hour', true);
  return hours;
}
