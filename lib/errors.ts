/** An error whose message is safe and meant to be shown to the user as-is. */
export class UserFacingError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
