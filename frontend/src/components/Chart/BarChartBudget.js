import _ from 'lodash';
import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const BarChartBudget = ({ projectSelect, budgets }) => {
  const b = [];
  const a = [];

  const d = _?.map(budgets, (e) => {
    _?.map(e?.totalStatus, (each) => {
      if (each?.status === 'APPROVE') return b.push(each?.totalExpenses);
    });
  });

  const ds = _?.map(budgets, (e) => {
    _?.map(e?.totalStatus, (each) => {
      if (each?.status === 'SUCCESS') return a.push(each?.totalExpenses);
    });
  });

  const [series, setSeries] = useState([
    {
      name: 'Budget',
      data: _?.map(budgets, (e) => e?.cost),
    },
    {
      name: 'Actual Spends',
      data: a,
    },
    {
      name: 'Estimate Spends',
      data: b,
    },
  ]);

  const [options, setOptions] = useState({
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: _?.map(budgets, (e) => e?.name),
    },
    yaxis: {
      title: {
        text: 'Amount (B)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `B${val}`,
      },
    },
  });

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default BarChartBudget;
