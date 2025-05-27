import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('simple_coverage')
export class SimpleCoverage {
  @PrimaryColumn()
  id: string;

  @Column()
  sha: string;

  @Column()
  branch: string;

  @Column()
  provider: string;

  @Column()
  repo_id: string;

  @Column()
  build_provider: string;

  @Column()
  build_id: string;

  @Column()
  branches_total: number;

  @Column()
  branches_covered: number;

  @Column()
  functions_total: number;

  @Column()
  functions_covered: number;

  @Column()
  lines_total: number;

  @Column()
  lines_covered: number;

  @Column()
  statements_total: number;

  @Column()
  statements_covered: number;

  @Column()
  newlines_total: number;

  @Column()
  newlines_covered: number;

  @Column()
  summary: string;

  @Column()
  hit: string;

  @Column()
  instrument_cwd: string;

  @Column()
  created_at: Date;
}
