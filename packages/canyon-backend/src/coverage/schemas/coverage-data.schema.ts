import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// 定义 'ant' 类型
// 定义 antType 类型
type CoverageType = {
  [key: string]: object;
};

@Schema()
export class CoverageData {
  @Prop()
  coverageID: string;

  @Prop({ type: Object })
  coverage: CoverageType;

  @Prop()
  v: string;

  @Prop()
  createdAt: Date;
}

export const CoverageDataSchema = SchemaFactory.createForClass(CoverageData);
