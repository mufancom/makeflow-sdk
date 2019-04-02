import ExtendableError from 'extendable-error';

export type ExpectedErrorCode =
  | 'ACCOUNT_NOT_AVAILABLE'
  | 'MOBILE_NOT_FOUND'
  | 'PASSWORD_MISMATCH'
  | 'RATE_LIMIT_REACHED'
  | 'PERMISSION_DENIED';

const expectedErrorMessageDict: {[key in ExpectedErrorCode]: string} = {
  ACCOUNT_NOT_AVAILABLE: 'Account not available',
  RATE_LIMIT_REACHED: 'Too many request',
  MOBILE_NOT_FOUND: 'Incorrect username or password',
  PASSWORD_MISMATCH: 'Incorrect username or password',
  PERMISSION_DENIED: 'Permission denied',
};

export class ExpectedError<
  TMessage extends string = string
> extends ExtendableError {
  message!: TMessage;

  constructor(readonly code: ExpectedErrorCode, message?: TMessage) {
    super(message || expectedErrorMessageDict[code]);
  }
}
