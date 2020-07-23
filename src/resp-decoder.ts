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
      const simpleString = input.slice(1, -2);
      if (simpleString.includes(CR)) 
        throw new Error('Simple Strings cannot contain a CR');
      if (simpleString.includes(LF)) 
        throw new Error('Simple Strings cannot contain a LF');
      return simpleString;
    default:
      throw new Error(`Unhandled first char: ${first}`);
  }

};
