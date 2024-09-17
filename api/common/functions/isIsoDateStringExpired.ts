export function isIsoDateStringExpired(isoDateString) {
  const currentDate = new Date().getTime();
  const expirationDate = new Date(isoDateString).getTime();
  return currentDate > expirationDate;
}
