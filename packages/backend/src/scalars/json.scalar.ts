import { CustomScalar, Scalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'

@Scalar('JSON')
export class JSONScalar implements CustomScalar<any, any> {
  description = 'Arbitrary JSON value'

  parseValue(value: any): any {
    return value
  }

  serialize(value: any): any {
    return value
  }

  parseLiteral(ast: ValueNode): any {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return (ast as any).value
      case Kind.INT:
      case Kind.FLOAT:
        return Number((ast as any).value)
      case Kind.OBJECT: {
        const value: Record<string, any> = {}
        ;(ast as any).fields.forEach((field: any) => {
          value[field.name.value] = this.parseLiteral(field.value)
        })
        return value
      }
      case Kind.LIST:
        return (ast as any).values.map((n: any) => this.parseLiteral(n))
      case Kind.NULL:
        return null
      default:
        return null
    }
  }
}
