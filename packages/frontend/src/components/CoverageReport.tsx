import {useParams} from "react-router-dom";

function CoverageReport() {
  const params = useParams();
  console.log(params);
  // {
  //   "provider": "gitlab",
  //   "org": "canyon-project",
  //   "repo": "canyon-demo",
  //   "subject": "pulls",
  //   "subjectID": "9",
  //   "*": "src/App.tsx"
  // }
  return <div>
    x
  </div>
}
export default CoverageReport
