import { GenericContainer, StartedTestContainer } from 'testcontainers';

/**
 * Manages test connections for isolated test environments
 */
export class TestContainers {
  private static redisHost: string;
  private static redisPort: number;
  private static isInitialized = false;

  /**
   * Initialize Redis connection settings
   */
  static async initialize(): Promise<{
    host: string;
    port: number;
  }> {
    if (this.isInitialized) {
      return {
        host: this.redisHost,
        port: this.redisPort,
      };
    }

    console.log('🔄 Setting up Redis connection...');

    try {
      // Check if we're running in a container environment
      const isInContainer =
        process.env.CONTAINER_ENV === 'true' ||
        process.env.IN_CONTAINER === 'true' ||
        process.env.DOCKER_ENV === 'true';

      if (isInContainer) {
        // Use the Redis service from docker-compose
        this.redisHost = process.env.REDIS_HOST || 'redis';
        this.redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        console.log(
          `✅ Using existing Redis at ${this.redisHost}:${this.redisPort}`,
        );
      } else {
        // For local development, try to use localhost Redis
        this.redisHost = process.env.REDIS_HOST || 'localhost';
        this.redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        console.log(
          `✅ Using local Redis at ${this.redisHost}:${this.redisPort}`,
        );
      }

      this.isInitialized = true;

      return {
        host: this.redisHost,
        port: this.redisPort,
      };
    } catch (error) {
      console.error('❌ Failed to set up Redis connection:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  static async cleanup(): Promise<void> {
    console.log('✅ Redis connection cleanup complete');
  }
}
