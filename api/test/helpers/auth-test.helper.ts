import { TestRequest } from './request.helper';
import { DatabaseTestHelper } from './database.helper';
import * as fixtures from '../fixtures';

export class AuthTestHelper {
  private request: TestRequest;
  private dbHelper: DatabaseTestHelper;

  constructor(request: TestRequest, dbHelper: DatabaseTestHelper) {
    this.request = request;
    this.dbHelper = dbHelper;
  }

  async register(userData: any): Promise<any> {
    const response = await this.request.post('/auth/register', userData);
    return response;
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await this.request.post('/auth/login', credentials);

    if (response.statusCode === 201) {
      // Save cookies for subsequent requests
      this.request.saveCookies(response);
    }

    return response;
  }

  async registerAndLogin(userData: any): Promise<any> {
    // Register the user
    const registerResponse = await this.register(userData);

    if (registerResponse.statusCode !== 201) {
      throw new Error(
        `Failed to register user: ${JSON.stringify(registerResponse.body)}`,
      );
    }

    // Login with the same credentials
    const loginResponse = await this.login({
      email: userData.email,
      password: userData.password,
    });

    if (loginResponse.statusCode !== 201) {
      throw new Error(`Failed to login: ${JSON.stringify(loginResponse.body)}`);
    }

    return loginResponse;
  }

  async logout(): Promise<any> {
    const response = await this.request.post('/auth/logout', {}, true);

    if (response.statusCode === 200) {
      // Update cookies after logout
      this.request.saveCookies(response);
    }

    return response;
  }
}
