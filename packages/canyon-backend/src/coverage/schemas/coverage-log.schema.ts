import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// 定义 'ant' 类型
// 定义 antType 类型
// type CoverageType = {
//   [key: string]: object;
// };

@Schema()
export class CoverageLog {
  @Prop()
  key: string;

  @Prop()
  sha: string;

  @Prop()
  projectID: string;

  @Prop()
  reportID: string;

  @Prop()
  instrumentCwd: string;

  @Prop()
  covType: string;

  @Prop()
  covOrigin: string;

  @Prop({ type: Object })
  tag: any;

  @Prop()
  createdAt: Date;
}

export const CoverageLogSchema = SchemaFactory.createForClass(CoverageLog);
