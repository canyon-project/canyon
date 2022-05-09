import {listAll} from "../../../dao/repo/repo";

export function handleAll(req,res) {
    console.log(123)
    const s = listAll
    res.send({name:123})
}
