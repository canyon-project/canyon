import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class GetUserRequestArgs {
  @Field(() => ID, {
    nullable: true,
    defaultValue: undefined,
    description: 'Collection ID of the user request',
  })
  collectionID?: string;
}
