import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ServiceStatus } from './helper';

@ObjectType()
export class InfraConfig {
  @Field({
    description: 'Infra Config Name',
  })
  name: string;

  @Field({
    description: 'Infra Config Value',
  })
  value: string;
}

registerEnumType(String, {
  name: 'InfraConfigEnum',
});

registerEnumType(String, {
  name: 'AuthProvider',
});

registerEnumType(ServiceStatus, {
  name: 'ServiceStatus',
});
