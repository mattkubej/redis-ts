import { CRLF, RESPType } from './constants';

export function encodeSimpleString(value: string): string {
  return `${RESPType.SimpleString}${value}${CRLF}`;
}

export function encodeBulkString(value: string): string {
  return `${RESPType.BulkString}${value.length}${CRLF}${value}${CRLF}`;
}

export function encodeInteger(value: number): string {
  return `${RESPType.Integer}${value}${CRLF}`;
}

export function encodeArray(values: string[]): string {
  return values.reduce(function (acc, cur) {
    return (acc += cur);
  }, `${RESPType.Array}${values.length}${CRLF}`);
}

export function encodeError(value: string): string {
  return `${RESPType.Error}ERR ${value}${CRLF}`;
}
