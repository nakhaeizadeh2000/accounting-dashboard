// Function to convert seconds to a Date instance
export function secondsToDate(seconds: number) {
  const date = new Date(Date.now() + seconds * 1000);
  return date;
}
