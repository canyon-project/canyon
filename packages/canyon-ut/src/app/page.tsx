'use client';
// import { Report } from "canyon-report";
import {useRequest} from "ahooks";
import axios from "axios";
import {Table} from "antd";

export default function Home() {
    const columns = [
        {
            title: 'path',
            dataIndex: 'path',
            key: 'path',
        },
    ]
    const {data} = useRequest(()=>axios.get(`/api/coverage/map`).then(r=>{
        return r.data
    }), {});

  return <div>
      {
          data &&<Table columns={columns} dataSource={Object.values(data)}/>
      }

  </div>
}
