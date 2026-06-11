import dayjs from 'dayjs';
import React from 'react';

export default function CalculateSalaryperday(holiday) {
  const date = dayjs();
  const dayOfWeek = date.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hl = holiday?.total;

  if (dayOfWeek == 0 || hl >= 1) {
    return 2;
  } else {
    return 1;
  }
}
