export type Data = number | null | string | Data[];

export const CR = '\r';
export const LF = '\n';
export const CRLF = `${CR}${LF}`;

// TODO: consider renaming this to prefix
export enum RESPType {
  SimpleString = '+',
  Error = '-',
  Integer = ':',
  BulkString = '$',
  Array = '*',
}

export const OK = `${RESPType.SimpleString}OK${CRLF}`;
export const NULL = `${RESPType.BulkString}-1${CRLF}`;
