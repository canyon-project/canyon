import { update as daoRepoUpdate } from "../../dao/repo";

const dao = {
    repo:{
        update:daoRepoUpdate
    }
}
export function update() {
    return dao.repo.update()
}
