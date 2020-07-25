const CR = '\\r';
const LF = '\\n';
const CRLF = `${CR}${LF}`;

enum RESPType {
  SimpleString = '+',
  Error = '-',
  Integer = ':',
  BulkString = '$',
  Array = '*',
};

export function decode(value: Buffer): string {
  const input = value.toString('utf8').trim();
  console.log(input);
  if (!input.endsWith(CRLF)) throw new Error('Incomplete command'); 

  const first = input[0];
  const bytes = input.substring(1);

  switch(first) {
    case RESPType.SimpleString:
      return decodeSimpleString(bytes);
    case RESPType.BulkString:
      return decodeBulkString(bytes);
    case RESPType.Array:
      return decodeArray(bytes);
    default:
      throw new Error(`Unhandled first char: ${first}`);
  }
};

function decodeSimpleString(input: string): string {
  const simpleString = input.slice(0, -4); //TODO: test this

  if (simpleString.includes(CR)) 
    throw new Error('Simple Strings cannot contain a CR');

  if (simpleString.includes(LF)) 
    throw new Error('Simple Strings cannot contain a LF');

  return simpleString;
};

function decodeBulkString(input: string): string {
  const bytes = Number(input[0]); //TODO: only handles single digit
  if (input.substr(1, 4) !== CRLF)
    throw new Error('Bulk String bytes must be terminated with CRLF');

  const bulkString = input.substr(5, bytes); //TODO: need to accommodate length of bytes
  if (bulkString.length !== bytes)
    throw new Error('Bulk String bytes does not match string length');

  return bulkString;
};

function decodeArray(input: string): string {
  let bytes = Number(input[0]); //TODO: only handles single digit

  while (bytes > 0) {
    const d = decode(Buffer.from(input.substr(5)));
    bytes--;
  }

  return input;
}
