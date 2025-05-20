import * as supertest from 'supertest';
import { TestApp } from '../test-app';
import { getTestBaseUrl } from '../setup-tests';

/**
 * TestRequest class for making HTTP requests to the test API
 * Uses supertest to make requests to the TestApp instance
 */
export class TestRequest {
  private baseUrl: string;
  private cookies: string[] = [];
  private agent: ReturnType<typeof supertest.agent>;

  /**
   * Create a new TestRequest instance
   * @param customBaseUrl Optional custom base URL (defaults to TestApp URL)
   */
  constructor(customBaseUrl?: string) {
    // Use custom URL if provided, otherwise get from TestApp
    this.baseUrl = customBaseUrl || getTestBaseUrl();

    // Create supertest agent - use base URL instead of TestApp instance
    this.agent = supertest.agent(this.baseUrl);

    console.log(`📡 TestRequest initialized with baseUrl: ${this.baseUrl}`);
  }

  /**
   * Save cookies from a response to use in subsequent requests
   * @param response The supertest response
   */
  saveCookies(response: supertest.Response): TestRequest {
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      this.cookies = Array.isArray(cookies) ? cookies : [cookies];
      console.log(`🍪 Saved ${this.cookies.length} cookies`);
    }
    return this;
  }

  /**
   * Make a GET request to the API
   * @param url The URL path (without base URL)
   * @param withAuth Whether to include auth cookies
   */
  async get(
    url: string,
    withAuth: boolean = false,
  ): Promise<supertest.Response> {
    console.log(`🔍 GET ${this.baseUrl}${url}`);

    const request = this.agent.get(url);

    // Add cookies if requested
    if (withAuth && this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    try {
      const response = await request;
      return response;
    } catch (error) {
      console.error(`❌ GET request to ${this.baseUrl}${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request to the API
   * @param url The URL path (without base URL)
   * @param data The request payload
   * @param withAuth Whether to include auth cookies
   */
  async post(
    url: string,
    data: any,
    withAuth: boolean = false,
  ): Promise<supertest.Response> {
    console.log(`📮 POST ${this.baseUrl}${url}`);
    console.log(`📦 Request payload:`, JSON.stringify(data, null, 2));

    const request = this.agent.post(url).send(data);

    // Add cookies if requested
    if (withAuth && this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    try {
      const response = await request;
      return response;
    } catch (error) {
      console.error(`❌ POST request to ${this.baseUrl}${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request to the API
   * @param url The URL path (without base URL)
   * @param data The request payload
   * @param withAuth Whether to include auth cookies
   */
  async put(
    url: string,
    data: any,
    withAuth: boolean = false,
  ): Promise<supertest.Response> {
    console.log(`📝 PUT ${this.baseUrl}${url}`);

    const request = this.agent.put(url).send(data);

    // Add cookies if requested
    if (withAuth && this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    try {
      const response = await request;
      return response;
    } catch (error) {
      console.error(`❌ PUT request to ${this.baseUrl}${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request to the API
   * @param url The URL path (without base URL)
   * @param withAuth Whether to include auth cookies
   */
  async delete(
    url: string,
    withAuth: boolean = false,
  ): Promise<supertest.Response> {
    console.log(`🗑️ DELETE ${this.baseUrl}${url}`);

    const request = this.agent.delete(url);

    // Add cookies if requested
    if (withAuth && this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    try {
      const response = await request;
      return response;
    } catch (error) {
      console.error(
        `❌ DELETE request to ${this.baseUrl}${url} failed:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Make a PATCH request to the API
   * @param url The URL path (without base URL)
   * @param data The request payload
   * @param withAuth Whether to include auth cookies
   */
  async patch(
    url: string,
    data: any,
    withAuth: boolean = false,
  ): Promise<supertest.Response> {
    console.log(`🩹 PATCH ${this.baseUrl}${url}`);

    const request = this.agent.patch(url).send(data);

    // Add cookies if requested
    if (withAuth && this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    try {
      const response = await request;
      return response;
    } catch (error) {
      console.error(`❌ PATCH request to ${this.baseUrl}${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Clear all saved cookies
   */
  clearCookies(): TestRequest {
    this.cookies = [];
    console.log('🧹 Cookies cleared');
    return this;
  }

  /**
   * Login with the given credentials and save auth cookies
   * @param credentials Login credentials (email/password)
   */
  async login(credentials: { email: string; password: string }): Promise<any> {
    console.log(`🔑 Logging in as ${credentials.email}`);

    try {
      const response = await this.post('/auth/login', credentials);

      if (response.status === 201) {
        this.saveCookies(response);
        console.log('✅ Login successful');
        return response.body.data;
      } else {
        console.error(`❌ Login failed with status ${response.status}`);
        console.error(response.body);
        throw new Error(`Login failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Login request failed:', error);
      throw error;
    }
  }

  /**
   * Upload a file to the API
   * @param url The URL path (without base URL)
   * @param fieldName The form field name
   * @param filePath The path to the file
   * @param withAuth Whether to include auth cookies
   */
  async uploadFile(
    url: string,
    fieldName: string,
    filePath: string,
    withAuth: boolean = false,
  ): Promise<supertest.Response> {
    console.log(`📤 Uploading file to ${this.baseUrl}${url}`);

    const request = this.agent.post(url).attach(fieldName, filePath);

    // Add cookies if requested
    if (withAuth && this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    try {
      const response = await request;
      return response;
    } catch (error) {
      console.error(`❌ File upload to ${this.baseUrl}${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Add custom headers to the next request
   * @param headers Key-value pairs of headers
   */
  withHeaders(headers: Record<string, string>): TestRequest {
    this.agent.set(headers);
    return this;
  }
}
