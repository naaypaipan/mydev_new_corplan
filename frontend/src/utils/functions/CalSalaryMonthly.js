import React from 'react';

export default function CalSalaryMonthly(
  baseSalary,
  salary_per_day,
  total_rate2,
  total_rate3,
) {
  const extra_2 = salary_per_day * total_rate2;
  const extra_3 = salary_per_day * total_rate3;

  return baseSalary + extra_2 + extra_3;
}
