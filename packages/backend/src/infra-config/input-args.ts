import { Field, InputType } from '@nestjs/graphql';
// import { InfraConfigEnum } from 'src/types/InfraConfig';
import { ServiceStatus } from './helper';
// import { AuthProvider } from 'src/auth/helper';

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
