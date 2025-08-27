import BasicLayout from '../layouts/BasicLayout.tsx'
import {useQuery} from "@apollo/client";
import {CodeFileContentDocument} from "../helpers/backend/gen/graphql.ts";
import { getDecode } from '../helpers/code.ts';
import {Editor} from "@monaco-editor/react";

const PlaygroundPage = () => {
  const {data} = useQuery(CodeFileContentDocument,{
    variables:{
      repoID: "115474",
      sha: "145d37a694a2a93e44b2751510a19f5b82afac37",
      filepath: "web/react-ui/overlay/placement.ts"
    }
  })
  return <BasicLayout>
    <div>
      <Editor value={getDecode(data?.codeFileContent?.content||'')} height="500px" language={'javascript'} />
    </div>
  </BasicLayout>
}
export default PlaygroundPage
