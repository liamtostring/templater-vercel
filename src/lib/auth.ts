import bcrypt from 'bcryptjs';

export interface AuthUser {
  username: string;
  authenticated: boolean;
}

/**
 * Simple authentication utility
 */
export class Auth {
  static getCredentials() {
    return {
      username: process.env.APP_USERNAME || 'admin',
      password: process.env.APP_PASSWORD || 'generator9097'
    };
  }

  static async verify(username: string, password: string): Promise<boolean> {
    const credentials = this.getCredentials();
    return username === credentials.username && password === credentials.password;
  }
}

export default Auth;
