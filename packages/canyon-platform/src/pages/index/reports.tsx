import ReactECharts from "echarts-for-react";
import {useRequest} from "ahooks";
import axios from "axios";
import {Select, Space, Table} from "antd";
import {useQuery} from "@apollo/client";
import {GetProjectsBuOptionsDocument} from "../../helpers/backend/gen/graphql.ts";
import {CanyonCardPrimary} from "canyon-ui-old";
import dayjs from "dayjs";

const {RangePicker} = DatePicker
const optionsWithDisabled = [
  { label: '图表', value: '图表' },
  { label: '表格', value: '表格' },
  // { label: 'Orange', value: 'Orange', disabled: true },
];

const Reports = () => {

  const [showType, setShowType] = useState('图表')
  const [bu, setBu] = useState('机票')
  const [range, setRange] = useState([dayjs().subtract(30, 'days'), dayjs()])

  const {data:getProjectsBuOptionsDocumentData} = useQuery(GetProjectsBuOptionsDocument)
  const {data:data=[],loading} = useRequest(()=>axios.get(`/api/coverage/reports`,{
    params:{
      bu,
      start:range[0].format('YYYY-MM-DD'),
      end:range[1].format('YYYY-MM-DD')
    }
  }).then(res=>res.data),{
    refreshDeps:[bu,range]
  });

  const columns = [
    {
      title: '项目',
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: '40%'
    },
    {
      title: 'UI自动化',
      dataIndex: 'auto',
      key: 'auto',
      sorter: (a, b) => a.auto - b.auto,
      defaultSortOrder: 'descend',
    },
    {
      title: '单元测试',
      dataIndex: 'ut',
      key: 'ut',
      sorter: (a, b) => a.ut - b.ut,
    }
  ]


  const opppppp = useMemo(()=>{
    const option = {
      // title: {
      //   text: '各仓库覆盖率数据统计'
      // },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: ['Brazil', 'Indonesia', 'USA', 'India', 'China', 'World']
      },
      series: [
        {
          name: 'UI自动化',
          type: 'bar',
          data: []
        },
        {
          name: '单元测试',
          type: 'bar',
          data: []
        }
      ]
    };
    option.yAxis.data = data.map(item => item.pathWithNamespace.split('/')[1]);
    option.series = [
      {
        name: 'UI自动化',
        type: 'bar',
        data: data.map(item => item.auto),
        label: {
          show: true,
          position: 'right'
        }
      },
      {
        name: '单元测试',
        type: 'bar',
        data: data.map(item => item.ut),
        label: {
          show: true,
          position: 'right'
        }
      }
    ];
    return option
  },[data])

  // 输出从
  return <CanyonCardPrimary>


    <div className={'bg-white dark:bg-[#0F0D28] p-5'}>
      <h3 className={'mb-5'}>各仓库覆盖率数据统计</h3>

      <Space className={'mb-5'}>
        <Radio.Group
          options={optionsWithDisabled}
          onChange={(v)=>{
            setShowType(v.target.value)
          }}
          value={showType}
          optionType="button"
          buttonStyle="solid"
        />
        <Select className={'w-[200px]'} value={bu}
                options={getProjectsBuOptionsDocumentData?.getProjectsBuOptions.map(({bu}) => ({
                  label: `${bu}`,
                  value: bu
                })) || []}
        onChange={(v)=>{
          setBu(v)
        }}
        />


        <RangePicker value={range} onChange={
          (v)=>{
            setRange(v)
          }
        } presets={[
          {
            label: '最近30天',
            // text: '最近7天',
            value: [dayjs().subtract(30, 'days'), dayjs()]
          },
          {
            label: '6月份',
            value: [dayjs('2024-06-01'), dayjs('2024-06-30')]
          },
          {
            label: '5月份',
            value: [dayjs('2024-05-01'), dayjs('2024-05-31')]
          },
          {
            label: '4月份',
            value: [dayjs('2024-04-01'), dayjs('2024-04-30')]
          },
        ]}/>
      </Space>

      <Spin spinning={loading}>
        {
          showType === '图表' ? (
            data.length > 0 ? <ReactECharts                 theme={
              localStorage.getItem('theme') === 'dark'
                ? 'dark'
                : {
                  color: ['#287DFA', '#FFB400'],
                }
            } option={opppppp} style={{
              height: `${data.length*50+100}px`
            }}/> : <div>暂无数据</div>
          ):      <Table dataSource={
            data
          } columns={columns} pagination={false} size={'small'}/>
        }
      </Spin>





    </div>


  </CanyonCardPrimary>
}

export default Reports;
