import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(private readonly userRepository: UserRepository) {}

  async onModuleInit() {
    // 初始化用户表
    await this.userRepository.initTable();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto, 'createUserDto');
    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.userRepository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 如果要更新邮箱，检查新邮箱是否已被其他用户使用
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async getStats(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.userRepository.count();
    return { totalUsers };
  }

  async findByPage(page: number = 1, limit: number = 10) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // 限制最大页面大小

    return this.userRepository.findByPage(page, limit);
  }
}
