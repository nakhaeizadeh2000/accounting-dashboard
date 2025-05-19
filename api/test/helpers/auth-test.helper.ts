import { TestRequest } from './request.helper';
import { LoginBodyDto } from '../../src/modules/auth/dto/login-body.dto';

export class AuthTestHelper {
  constructor(private readonly request: TestRequest) {}

  async login(credentials: LoginBodyDto): Promise<any> {
    const response = await this.request.post('/auth/login', credentials);

    // Ensure the login was successful
    if (response.status !== 201) {
      throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
    }

    return response.body.data;
  }

  async logout(): Promise<void> {
    await this.request.post('/auth/logout', {}, true);
    this.request.clearCookies();
  }

  async registerAndLogin(userData: any): Promise<any> {
    // Register
    const registerResponse = await this.request.post(
      '/auth/register',
      userData,
    );

    // Login
    return this.login({
      email: userData.email,
      password: userData.password,
    });
  }
}
