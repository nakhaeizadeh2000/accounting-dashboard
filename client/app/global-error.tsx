'use client'; // Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p>error: {error.cause as string}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

// TODO: work on UI/UX of this global error (for test just use this in a client component instead of return a jsx : throw new Error('API error'); )
