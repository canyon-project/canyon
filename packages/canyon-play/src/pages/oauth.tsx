import {CanyonPageOauth} from "canyon-ui/src";

const Oauth = () => {
  return <div>
    <CanyonPageOauth onSHibai={()=>{
      console.log('失败')
    }}/>
  </div>
}

export default Oauth;
