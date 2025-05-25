import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { parse as parseCookieString } from 'cookie';
import { getTestBaseUrl } from '../setup-tests';

/**
 * TestRequest class for making HTTP requests to the test API
 * Uses supertest to make requests to the TestApp instance
 */
export class TestRequest {
  private app: INestApplication;
  private cookies: Record<string, string>;
  private headers: Record<string, string>;
  private baseUrl: string;

  /**
   * Create a new TestRequest instance
   */
  constructor() {
    this.cookies = {};
    this.headers = {};
    this.baseUrl = '';
  }

  /**
   * Set the NestJS application for testing
   */
  public setApp(app: INestApplication): void {
    this.app = app;
    try {
      // Try to get the base URL from the setup-tests utility
      this.baseUrl = getTestBaseUrl();
      console.log(`Using base URL: ${this.baseUrl}`);
    } catch (error) {
      console.warn(`Could not get baseUrl from setup-tests, using default`);
      this.baseUrl = 'http://localhost:4001/api';
    }
  }

  /**
   * Set a header for subsequent requests
   */
  public setHeader(name: string, value: string): void {
    this.headers = { ...this.headers, [name]: value };
  }

  /**
   * Clear all custom headers
   */
  public clearHeaders(): void {
    this.headers = {};
  }

  /**
   * Clear all saved cookies
   */
  public clearCookies(): void {
    this.cookies = {};
  }

  /**
   * Set an invalid JWT token for testing auth failures
   */
  public setInvalidAuthToken(): void {
    this.headers = {
      ...this.headers,
      Authorization: 'Bearer invalid.token.here',
    };
  }

  /**
   * Save cookies from a response to use in subsequent requests
   * @param response The supertest response
   */
  public saveCookies(response: any): void {
    if (response.headers['set-cookie']) {
      const cookieStrings = Array.isArray(response.headers['set-cookie'])
        ? response.headers['set-cookie']
        : [response.headers['set-cookie']];

      cookieStrings.forEach((cookieStr) => {
        const parsed = parseCookieString(cookieStr);
        const cookieName = Object.keys(parsed)[0];
        const cookieValue = parsed[cookieName];

        if (cookieValue === '') {
          // Cookie is being cleared
          delete this.cookies[cookieName];
        } else {
          this.cookies[cookieName] = cookieValue;
        }
      });
    }
  }

  /**
   * Get request options with headers and cookies
   * @param withAuth Whether to include auth cookies
   */
  private getRequestOptions(withAuth: boolean): {
    headers: Record<string, string>;
  } {
    const headers = { ...this.headers };
    const cookies = { ...this.cookies };

    if (withAuth) {
      // Add cookies as a Cookie header
      const cookieString = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

      if (cookieString) {
        headers.Cookie = cookieString;
      }
    } else {
      delete headers.Authorization;
      delete headers.Cookie;
    }

    return { headers };
  }

  /**
   * Make a GET request to the API
   * @param url The URL path
   * @param withAuth Whether to include auth cookies
   */
  public async get(url: string, withAuth = false): Promise<any> {
    if (!this.app) {
      throw new Error('App not initialized. Call setApp() first.');
    }

    const options = this.getRequestOptions(withAuth);
    const agent = request(this.app.getHttpServer());

    // Ensure URL has correct prefix
    const fullUrl = this.ensureCorrectUrlPrefix(url);
    console.log(`Making GET request to: ${fullUrl}`);

    let req = agent.get(fullUrl);

    // Apply headers
    Object.entries(options.headers).forEach(([name, value]) => {
      req = req.set(name, value);
    });

    return req;
  }

  /**
   * Make a POST request to the API
   * @param url The URL path
   * @param data The request payload
   * @param withAuth Whether to include auth cookies
   */
  public async post(url: string, data: any, withAuth = false): Promise<any> {
    if (!this.app) {
      throw new Error('App not initialized. Call setApp() first.');
    }

    const options = this.getRequestOptions(withAuth);
    const agent = request(this.app.getHttpServer());

    // Ensure URL has correct prefix
    const fullUrl = this.ensureCorrectUrlPrefix(url);
    console.log(`Making POST request to: ${fullUrl}`);

    let req = agent.post(fullUrl).send(data);

    // Apply headers
    Object.entries(options.headers).forEach(([name, value]) => {
      req = req.set(name, value);
    });

    return req;
  }

  /**
   * Make a PUT request to the API
   * @param url The URL path
   * @param data The request payload
   * @param withAuth Whether to include auth cookies
   */
  public async put(url: string, data: any, withAuth = false): Promise<any> {
    if (!this.app) {
      throw new Error('App not initialized. Call setApp() first.');
    }

    const options = this.getRequestOptions(withAuth);
    const agent = request(this.app.getHttpServer());

    // Ensure URL has correct prefix
    const fullUrl = this.ensureCorrectUrlPrefix(url);
    console.log(`Making PUT request to: ${fullUrl}`);

    let req = agent.put(fullUrl).send(data);

    // Apply headers
    Object.entries(options.headers).forEach(([name, value]) => {
      req = req.set(name, value);
    });

    return req;
  }

  /**
   * Make a DELETE request to the API
   * @param url The URL path
   * @param withAuth Whether to include auth cookies
   */
  public async delete(url: string, withAuth = false): Promise<any> {
    if (!this.app) {
      throw new Error('App not initialized. Call setApp() first.');
    }

    const options = this.getRequestOptions(withAuth);
    const agent = request(this.app.getHttpServer());

    // Ensure URL has correct prefix
    const fullUrl = this.ensureCorrectUrlPrefix(url);
    console.log(`Making DELETE request to: ${fullUrl}`);

    let req = agent.delete(fullUrl);

    // Apply headers
    Object.entries(options.headers).forEach(([name, value]) => {
      req = req.set(name, value);
    });

    return req;
  }

  /**
   * Make a PATCH request to the API
   * @param url The URL path
   * @param data The request payload
   * @param withAuth Whether to include auth cookies
   */
  public async patch(url: string, data: any, withAuth = false): Promise<any> {
    if (!this.app) {
      throw new Error('App not initialized. Call setApp() first.');
    }

    const options = this.getRequestOptions(withAuth);
    const agent = request(this.app.getHttpServer());

    // Ensure URL has correct prefix
    const fullUrl = this.ensureCorrectUrlPrefix(url);
    console.log(`Making PATCH request to: ${fullUrl}`);

    let req = agent.patch(fullUrl).send(data);

    // Apply headers
    Object.entries(options.headers).forEach(([name, value]) => {
      req = req.set(name, value);
    });

    return req;
  }

  // Helper method to ensure URL has correct prefix
  private ensureCorrectUrlPrefix(url: string): string {
    // If the URL already starts with the base path or is a full URL, return as is
    if (url.startsWith('/api/') || url.startsWith('http')) {
      return url;
    }

    // If URL starts with a slash, remove it to avoid double slashes
    if (url.startsWith('/')) {
      url = url.substring(1);
    }

    // Return URL with /api/ prefix
    return `/api/${url}`;
  }
}
