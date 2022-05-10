import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type CoverageDocument = Coverage & Document

@Schema()
export class Coverage {
  @Prop()
  coverage: string
}

export const CoverageSchema = SchemaFactory.createForClass(Coverage)
