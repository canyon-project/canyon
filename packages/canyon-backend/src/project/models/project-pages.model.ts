import { Field, ObjectType } from "@nestjs/graphql";
import { Project } from "../project.model";

@ObjectType()
export class ProjectPagesModel {
    @Field(() => [Project])
    data: Project[];

    @Field(() => Number)
    total: number;
}
