class BaseError extends Error {
	constructor(
		message: string,
		public statusCode = 500,
		public isOperational = true,
		public metadata: Record<string, any> = {},
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class UserNotFoundError extends BaseError {
	constructor(message: string) {
		super(message, 404);
	}
}

export class InsertionConflicError extends BaseError {
	constructor(message: string, fields: { violator: 'username' | 'email' | 'unknown' }) {
		super(message, 409, true, { fields });
	}
}

export class ForeignKeyError extends BaseError {
	constructor(
		message: string,
		fields?: { constraintName: string | undefined; offendingData: string | number | undefined },
	) {
		super(message, 422, true, fields);
	}
}
