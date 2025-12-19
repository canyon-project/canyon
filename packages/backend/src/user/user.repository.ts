import { Injectable } from '@nestjs/common';
import { SqliteService } from '../sqlite/sqlite.service';
import { User, CreateUserDto, UpdateUserDto } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly sqliteService: SqliteService) {}

  async initTable(): Promise<void> {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.sqliteService.connection.execute(createTableSql);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, age } = createUserDto;
    const sql = `
      INSERT INTO users (name, email, age, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const result = await this.sqliteService.connection.execute(sql, [name, email, age]);

    // 获取插入的用户 ID (better-sqlite3 返回 lastInsertRowid)
    const insertId = (result as any).lastInsertRowid || (result as any).insertId;
    console.log(result,'resultresultresult')
    const user = await this.findById(insertId);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    const sql = `
      SELECT
        id,
        name,
        email,
        age,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users
      ORDER BY created_at DESC
    `;

    return this.sqliteService.connection.query<User>(sql);
  }

  async findById(id: number): Promise<User | null> {
    const sql = `
      SELECT
        id,
        name,
        email,
        age,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users
      WHERE id = ?
    `;

    const results = await this.sqliteService.connection.query<User>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT
        id,
        name,
        email,
        age,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users
      WHERE email = ?
    `;

    const results = await this.sqliteService.connection.query<User>(sql, [email]);
    return results.length > 0 ? results[0] : null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updateUserDto.name !== undefined) {
      fields.push('name = ?');
      values.push(updateUserDto.name);
    }

    if (updateUserDto.email !== undefined) {
      fields.push('email = ?');
      values.push(updateUserDto.email);
    }

    if (updateUserDto.age !== undefined) {
      fields.push('age = ?');
      values.push(updateUserDto.age);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    await this.sqliteService.connection.execute(sql, values);

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    await this.sqliteService.connection.execute(sql, [id]);

    // 检查是否删除成功
    const user = await this.findById(id);
    return user === null;
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM users';
    const result = await this.sqliteService.connection.query<{ count: number }>(sql);

    return result[0]?.count || 0;
  }

  async findByPage(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        id,
        name,
        email,
        age,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await this.sqliteService.connection.query<User>(sql, [limit, offset]);
    const total = await this.count();

    return {
      users,
      total,
      page,
      limit,
    };
  }
}
