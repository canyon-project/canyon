import {AppDataSource} from "../../data-source";
import {User} from "../../model/User";

export function listAll() {
    return []
}

export function update() {
    const photoRepository = AppDataSource.getRepository(User)
    return photoRepository.findOneBy({id:1})
}
