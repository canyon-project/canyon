import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ut_coverage")
export class CoverageUtEntity {
  // 主键，自动生成string类型的id
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // sha 列
  @Column()
  sha: string;

  // branch 列
  @Column()
  branch: string;

  // project_id 列
  @Column({ name: "project_id" })
  projectID: string;

  // branches_total 列
  @Column({ name: "branches_total" })
  branchesTotal: number;

  // branches_covered 列
  @Column({ name: "branches_covered" })
  branchesCovered: number;

  // functions_total 列
  @Column({ name: "functions_total" })
  functionsTotal: number;

  // functions_covered 列
  @Column({ name: "functions_covered" })
  functionsCovered: number;

  // lines_total 列
  @Column({ name: "lines_total" })
  linesTotal: number;

  // lines_covered 列
  @Column({ name: "lines_covered" })
  linesCovered: number;

  // statements_total 列
  @Column({ name: "statements_total" })
  statementsTotal: number;

  // statements_covered 列
  @Column({ name: "statements_covered" })
  statementsCovered: number;

  // newlines_total 列
  @Column({ name: "newlines_total" })
  newlinesTotal: number;

  // newlines_covered 列
  @Column({ name: "newlines_covered" })
  newlinesCovered: number;

  // summary 列
  @Column()
  summary: string;

  // hit 列
  @Column()
  hit: string;

  // source_type 列
  @Column({ name: "source_type" })
  sourceType: string;

  // instrument_cwd 列
  @Column({ name: "instrument_cwd" })
  instrumentCwd: string;
}
