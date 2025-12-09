export interface LoginRequest {
  usernameOrEmail: string; 
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface RefreshRequest {}

export interface UserDto {
    id: string;
    username: string;
    email: string;
    roles: string[];
}