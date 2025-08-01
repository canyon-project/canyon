import {Button} from "antd";
import {useEffect} from "react";
import axios from "axios";

const Home = () => {
  useEffect(() => {
    axios.get(`/api/v1/coverage`).then(r=>{
      console.log(r.data)
    })
  }, []);
  return <div>
      <Button type={'primary'}>primary</Button>
  </div>
}

export default Home;
