import {update as logicRepoUpdate} from "../../../logic/repo";

const logic = {
    repo: {update: logicRepoUpdate}
}

export async function update(req, res) {
    res.send(await logic.repo.update())
}
