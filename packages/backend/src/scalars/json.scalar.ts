import { type CustomScalar, Scalar } from '@nestjs/graphql';
import {
  Kind,
  type ListValueNode,
  type ObjectValueNode,
  type ValueNode,
} from 'graphql';

@Scalar('JSON')
export class JSONScalar implements CustomScalar<unknown, unknown> {
  description = 'Arbitrary JSON value';

  parseValue(value: unknown): unknown {
    return value;
  }

  serialize(value: unknown): unknown {
    return value;
  }

  parseLiteral(ast: ValueNode): unknown {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return (ast as { value: string | boolean }).value;
      case Kind.INT:
      case Kind.FLOAT:
        return Number((ast as { value: string }).value);
      case Kind.OBJECT: {
        const objAst = ast as ObjectValueNode;
        const value: Record<string, unknown> = {};
        objAst.fields.forEach((field) => {
          value[field.name.value] = this.parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return (ast as ListValueNode).values.map((n) => this.parseLiteral(n));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  }
}
