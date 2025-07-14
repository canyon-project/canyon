import {useParams} from "react-router";

function Projects() {
    const params = useParams()
    console.log(params)
    return <div>
        projects
    </div>
}
export default  Projects;