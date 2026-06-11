import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const BarChartExample = () => {
  const [series, setSeries] = useState([
    {
      name: 'Budget',
      data: [4000, 3000, 2000, 1000, 5000],
    },
    {
      name: 'Actual Spend',
      data: [3000, 2500, 1500, 800, 4500],
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
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
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

export default BarChartExample;
