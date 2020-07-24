const CR = '\r';
const LF = '\n';
const CRLF = `${CR}${LF}`;

enum RESPType {
  SimpleString = '+',
  Error = '-',
  Integer = '',
  BulkString = '$',
  Array = '*',
};

export function decode(value: Buffer): string {
  const input = value.toString('utf8');
  if (!input.endsWith(CRLF)) throw new Error('Incomplete command'); 

  const first = input[0];
  switch(first) {
    case RESPType.SimpleString:
      return decodeSimpleString(input);
    case RESPType.BulkString:
      return decodeBulkString(input);
    default:
      throw new Error(`Unhandled first char: ${first}`);
  }

};

function decodeSimpleString(input: string): string {
  const simpleString = input.slice(1, -2);

  if (simpleString.includes(CR)) 
    throw new Error('Simple Strings cannot contain a CR');

  if (simpleString.includes(LF)) 
    throw new Error('Simple Strings cannot contain a LF');

  return simpleString;
}

function decodeBulkString(input: string): string {
  const bytes = Number(input[1]);
  if (input.substr(2, 2) !== CRLF)
    throw new Error('Bulk String bytes must be terminated with CRLF');

  const bulkString = input.substr(4, bytes);
  if (bulkString.length !== bytes)
    throw new Error('Bulk String bytes does not match string length');

  return bulkString;
}
