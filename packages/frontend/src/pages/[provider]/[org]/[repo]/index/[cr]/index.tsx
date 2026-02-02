import { useParams } from "react-router-dom";

const CRDetailPage = () => {
    const { cr } = useParams();
    console.log(cr);
  return (
    <div>
      <h1>
        github pull/6
        gitlab merge_request/6
      </h1>
    </div>
  );
};

export default CRDetailPage;