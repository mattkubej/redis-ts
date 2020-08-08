export function encodeSimpleString(value: string): string {
  return `+${value}\r\n`;
}

export function encodeBulkString(value: string): string {
  return `$${value.length}\r\n${value}\r\n`;
}

export function encodeInteger(value: number): string {
  return `:${value}\r\n`;
}

export function encodeArray(values: string[]): string {
  return values.reduce(function (acc, cur) {
    return (acc += cur);
  }, `*${values.length}\r\n`);
}
