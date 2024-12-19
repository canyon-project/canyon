import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Project2 {
    @Field(() => ID)
    id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    pathWithNamespace: string;

    @Field(() => String)
    description: string;
}
