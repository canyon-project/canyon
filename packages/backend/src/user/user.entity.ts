export interface User {
  id?: number;
  name: string;
  email: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}