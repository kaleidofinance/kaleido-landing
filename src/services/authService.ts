import { JWTPayload } from '@/lib/jwt';

const AUTH_TOKEN_KEY = 'kaleido_auth_token';
const USER_DATA_KEY = 'kaleido_user_data';

export interface UserData {
  email: string;
  walletAddress: string;
  socialTasks: {
    twitter: boolean;
    telegram: boolean;
    discord: boolean;
  };
  agreedToTerms: boolean;
  referralCode: string;
  referralCount: number;
  referralBonus: number;
  xUsername?: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  public setUserData(userData: UserData): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }

  public getUserData(): UserData | null {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public clear(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }

  public getAuthHeader(): { Authorization: string } | undefined {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

export const authService = AuthService.getInstance();
