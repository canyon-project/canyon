import React from 'react';
import ReactECharts from 'echarts-for-react';

const EChartsDemo: React.FC = () => {
  // 柱状图配置
  const barOption = {
    title: {
      text: '销售数据统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销量', '利润'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: ['一月', '二月', '三月', '四月', '五月', '六月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110],
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '利润',
        type: 'bar',
        data: [60, 100, 75, 40, 35, 55],
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  };

  // 饼图配置
  const pieOption = {
    title: {
      text: '市场份额分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 50
    },
    series: [
      {
        name: '市场份额',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 335, name: '产品A' },
          { value: 310, name: '产品B' },
          { value: 234, name: '产品C' },
          { value: 135, name: '产品D' },
          { value: 1548, name: '产品E' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 折线图配置
  const lineOption = {
    title: {
      text: '网站访问量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        smooth: true,
        itemStyle: {
          color: '#ee6666'
        },
        areaStyle: {
          color: 'rgba(238, 102, 102, 0.3)'
        }
      }
    ]
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        ECharts 图表示例
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <ReactECharts 
            option={barOption} 
            style={{ height: '400px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <ReactECharts 
            option={pieOption} 
            style={{ height: '400px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <ReactECharts 
          option={lineOption} 
          style={{ height: '400px' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
};

export default EChartsDemo;