export class applicationNotFoundError extends Error {
  readonly name = "ApplicationNotFoundError";

  constructor(id: string) {
    super(`Application not found: ${id}`);
  }
}

export class jobNotFoundError extends Error {
  readonly name = "JobNotFoundError";

  constructor(id: string) {
    super(`Job not found: ${id}`);
  }
}
