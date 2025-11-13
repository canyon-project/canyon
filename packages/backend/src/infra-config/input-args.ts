import { Field, InputType } from '@nestjs/graphql';
import { ServiceStatus } from './helper';

@InputType()
export class InfraConfigArgs {
  @Field(() => String, {
    description: 'Infra Config Name',
  })
  name: string;

  @Field({
    description: 'Infra Config Value',
  })
  value: string;
}

@InputType()
export class EnableAndDisableSSOArgs {
  @Field(() => String, {
    description: 'Auth Provider',
  })
  provider: string;

  @Field(() => ServiceStatus, {
    description: 'Auth Provider Status',
  })
  status: ServiceStatus;
}
