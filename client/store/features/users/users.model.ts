// User information for responses
export interface ResponseUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User with roles information
export interface ResponseUserRoleDto extends ResponseUserDto {
  roles: {
    id: number;
    name: string;
  }[];
}

// Interface for creating a new user
export interface CreateUserDto {
  email: string;
  password: string;
  repeatPassword: string;
  firstName?: string;
  lastName?: string;
}

// Interface for updating an existing user
export interface UpdateUserDto {
  oldPassword?: string;
  password?: string;
  repeatPassword?: string;
  firstName?: string;
  lastName?: string;
}