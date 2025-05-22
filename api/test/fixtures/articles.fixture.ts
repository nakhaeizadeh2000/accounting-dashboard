/**
 * Pre-defined article data for tests
 */
export const articles = [
  {
    title: 'Getting Started with NestJS',
    content:
      'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
    authorId: null, // Will be set during test setup
  },
  {
    title: 'Authorization with CASL',
    content:
      'CASL is an isomorphic authorization library which restricts what resources a given user is allowed to access.',
    authorId: null,
  },
  {
    title: 'Caching in NestJS',
    content:
      'Caching is a great and simple technique that helps improve your app performance.',
    authorId: null,
  },
  {
    title: 'Draft Article - Not Published',
    content:
      'This is a draft article that should only be visible to administrators and the author.',
    authorId: null,
  },
];

/**
 * Factory function to create an article with custom properties
 * @param overrides Properties to override in the default article
 * @returns An article object with default values merged with overrides
 */
export const createArticle = (overrides: Record<string, any> = {}) => {
  const defaultArticle = {
    title: `Test Article ${Date.now()}`,
    content: 'This is a test article created for automated testing.',
    authorId: null,
  };

  return { ...defaultArticle, ...overrides };
};

/**
 * Create multiple articles with sequential titles
 * @param count Number of articles to create
 * @param baseProps Base properties to apply to all articles
 * @returns Array of article objects
 */
export const createArticles = (
  count: number,
  baseProps: Record<string, any> = {},
) => {
  return Array(count)
    .fill(null)
    .map((_, index) =>
      createArticle({
        title: `Test Article ${index}`,
        ...baseProps,
      }),
    );
};
