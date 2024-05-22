import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CoverageTest {
  @Prop()
  projectID: string;

  @Prop()
  sha: string;

  @Prop()
  coverage: string;

  @Prop()
  createdAt: Date;
}

export const CoverageTestSchema = SchemaFactory.createForClass(CoverageTest);
