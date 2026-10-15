import type { ErrorCode, ErrorParam } from "./i18n";

/** An expected failure the user should see. The client renders `code` in the visitor's language. */
export class UserFacingError extends Error {
  constructor(
    public code: ErrorCode,
    public params: ErrorParam[] = [],
    public status = 400,
  ) {
    super(code);
  }
}
