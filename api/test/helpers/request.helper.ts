import * as supertest from 'supertest';

export class TestRequest {
  private baseUrl: string;
  private cookies: string[] = [];
  // Using any here is not ideal but works around the type limitation
  private agent: any;

  constructor(baseUrl: string = 'http://localhost:4000/api') {
    this.baseUrl = baseUrl;
    // This is valid SuperTest usage even if the types don't reflect it properly
    this.agent = supertest.agent(this.baseUrl);
  }

  // No need for init() if we're just connecting to a running server

  saveCookies(response: supertest.Response) {
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      this.cookies = Array.isArray(cookies) ? cookies : [cookies];
    }
    return this;
  }

  async get(url: string, headers: Record<string, string> = {}) {
    const request = this.agent.get(url).set(headers);

    if (this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    return request;
  }

  async post(url: string, data: any, headers: Record<string, string> = {}) {
    const request = this.agent.post(url).send(data).set(headers);

    if (this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    return request;
  }

  async put(url: string, data: any, headers: Record<string, string> = {}) {
    const request = this.agent.put(url).send(data).set(headers);

    if (this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    return request;
  }

  async delete(url: string, headers: Record<string, string> = {}) {
    const request = this.agent.delete(url).set(headers);

    if (this.cookies.length > 0) {
      request.set('Cookie', this.cookies);
    }

    return request;
  }

  clearCookies() {
    this.cookies = [];
    return this;
  }
}
