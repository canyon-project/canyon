import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "./user.model";
import { User as DbUser } from "@prisma/client";
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    /**
     * 将 prisma 用户对象转换为用户对象
     *
     * @param dbUser Prisma User object
     * @returns  User object
     */
    convertDbUserToUser(dbUser: DbUser): Promise<User> {
        return this.prisma.user.findFirst({
            where: {
                id: String(dbUser.id),
            },
        });
    }
    async favorProject(
        user: User,
        projectID: string,
        favored: boolean,
    ): Promise<User> {
        const favorProjects = await this.prisma.user
            .findUnique({
                where: {
                    id: String(user.id),
                },
            })
            .then((r) => r.favor.split(",").filter((item) => item !== ""));

        let favors = [];
        if (favored) {
            favors = favorProjects.concat(projectID);
        } else {
            favors = favorProjects.filter((item) => item !== projectID);
        }
        return this.prisma.user.update({
            where: {
                id: String(user.id),
            },
            data: {
                favor: favors.join(","),
            },
        });
    }
}
