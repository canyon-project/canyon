import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('simple_git_provider')
export class SimpleGitProvider {
  @PrimaryColumn()
  id: string;

  @Column()
  url: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  disabled: boolean;

  @Column({ name: 'private_token' })
  privateToken: string;
}
