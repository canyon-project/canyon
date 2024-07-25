import EChartsReact from 'echarts-for-react';
const data = {
  Month: ['1月', '2月', '3月', '4月', '5月', '6月'],
  'Branch Coverage (%)': [50.59, 51.45, 50.05, 55.15, 57.84, 62.84],
  'Branches Covered': [7989.63, 10342.33, 9282.85, 10135.42, 10833.31, 11423.75, 9865.54],
  'Total Branches': [15793.13, 20100.67, 18545.65, 18379.0, 18730.27, 18179.46, 15800.5],
  'Line Coverage (%)': [66.08, 67.18, 64.81, 68.7, 71.82, 76.37, 74.99],
  'Lines Covered': [12419.25, 15639.6, 13336.25, 13874.58, 14477.35, 15446.29, 12824.38],
  'Total Lines': [18793.88, 23281.6, 20575.95, 20197.21, 20159.0, 20224.75, 17101.77],
  'Changed Line Coverage (%)': [null, 93.76, 93.95, 95.49, 95.1, 96.13],
  'Changed Lines Covered': [7.38, 1073.27, 1162.4, 1460.53, 582.08, 224.88, 526.96],
  'Changed Lines': [7.38, 1144.67, 1237.3, 1529.58, 612.08, 233.92, 558.38],
};
const d1 = [58.93, 59.07, 58.86, 58.93, 58.73, 59.04];
const d2 = [40.94, 42.18, 41.71, 42.13, 42.69, 44.37];
const data1 = {
  Month: ['1月', '2月', '3月', '4月', '5月', '6月'],
  'Branch Coverage (%)': d1,
  'Branches Covered': [7989.63, 10342.33, 9282.85, 10135.42, 10833.31, 11423.75, 9865.54],
  'Total Branches': [15793.13, 20100.67, 18545.65, 18379.0, 18730.27, 18179.46, 15800.5],
  'Line Coverage (%)': d2,
  'Lines Covered': [12419.25, 15639.6, 13336.25, 13874.58, 14477.35, 15446.29, 12824.38],
  'Total Lines': [18793.88, 23281.6, 20575.95, 20197.21, 20159.0, 20224.75, 17101.77],
  'Changed Line Coverage (%)': [null, 93.76, 93.95, 95.49, 95.1, 96.13],
  'Changed Lines Covered': [7.38, 1073.27, 1162.4, 1460.53, 582.08, 224.88, 526.96],
  'Changed Lines': [7.38, 1144.67, 1237.3, 1529.58, 612.08, 233.92, 558.38],
};

const option = {
  title: {
    text: 'UI自动化覆盖率',
  },
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['Branch Coverage (%)', 'Line Coverage (%)', 'Changed Line Coverage (%)'],
    right: 10,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: data.Month,
  },
  yAxis: {
    type: 'value',
    max: 100,
  },
  series: [
    {
      name: 'Branch Coverage (%)',
      type: 'line',
      data: data['Branch Coverage (%)'],
    },
    {
      name: 'Line Coverage (%)',
      type: 'line',
      data: data['Line Coverage (%)'],
    },
    {
      name: 'Changed Line Coverage (%)',
      type: 'line',
      data: data['Changed Line Coverage (%)'],
    },
  ],
};

const option1 = {
  title: {
    text: 'UT覆盖率',
  },
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['Branch Coverage (%)', 'Line Coverage (%)', 'Changed Line Coverage (%)'],
    right: 10,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: data.Month,
  },
  yAxis: {
    type: 'value',
    max: 100,
  },
  series: [
    {
      name: 'Branch Coverage (%)',
      type: 'line',
      data: data1['Branch Coverage (%)'],
    },
    {
      name: 'Line Coverage (%)',
      type: 'line',
      data: data1['Line Coverage (%)'],
    },
  ],
};
const Test = () => {
  return (
    <div>
      <EChartsReact className={'w-[700px]'} style={{ height: '300px' }} option={option} />
      <EChartsReact className={'w-[700px]'} style={{ height: '300px' }} option={option1} />
    </div>
  );
};

export default Test;
