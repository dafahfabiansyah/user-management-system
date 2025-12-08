export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalUsers: number;
  };
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
