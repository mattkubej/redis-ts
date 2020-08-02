export const CR = '\r';
export const LF = '\n';
export const CRLF = `${CR}${LF}`;

export enum RESPType {
  SimpleString = '+',
  Error = '-',
  Integer = ':',
  BulkString = '$',
  Array = '*',
};
