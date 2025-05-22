import { TestRequest } from './request.helper';
import { DatabaseTestHelper } from './database.helper';

export class AuthTestHelper {
  private request: TestRequest;
  private dbHelper: DatabaseTestHelper;

  constructor(request: TestRequest, dbHelper: DatabaseTestHelper) {
    this.request = request;
    this.dbHelper = dbHelper;
  }

  async registerAndLogin(userData: any): Promise<any> {
    // Register
    await this.register(userData);

    // Login with simplified approach - don't keep waiting for slow responses
    const loginResponse = await this.request.post('/auth/login', {
      email: userData.email,
      password: userData.password,
    });

    // Save cookies
    this.request.saveCookies(loginResponse);

    return loginResponse.body.data;
  }

  async register(userData: any): Promise<any> {
    const response = await this.request.post('/auth/register', userData);
    return response.body.data;
  }

  async logout(): Promise<void> {
    await this.request.post('/auth/logout', {}, true);
    this.request.clearCookies();
  }
}
