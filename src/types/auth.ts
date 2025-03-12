export type UserRole = 'school_admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}