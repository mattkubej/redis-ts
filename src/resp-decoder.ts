const CR = '\r';
const LF = '\n';
const CRLF = `${CR}${LF}`;

enum RESPType {
  SimpleString = '+',
  Error = '-',
  Integer = ':',
  BulkString = '$',
  Array = '*',
};

type DecodeResult = {
  value: string | (string|number)[];
  readIndex: number;
};

// TODO: improve error handling
export function decode(value: Buffer): (string|number)[] {
  const { value: result, readIndex} = parse(value);

  if (readIndex !== value.length) {
    throw new Error('Read values does not match buffer length.');
  }

  if (typeof result === 'string') {
    return [result];
  }

  return result;
};

function parse(value: Buffer, readIndex: number = 0): DecodeResult {
  const type = value.toString('utf8', readIndex, ++readIndex);

  switch(type) {
    case RESPType.SimpleString:
      return decodeSimpleString(value, readIndex);
    case RESPType.BulkString:
      return decodeBulkString(value, readIndex);
    case RESPType.Array:
      return decodeArray(value, readIndex);
    default:
      throw new Error(`Unrecognized type: ${type}`);
  }
};

// TODO: clean up implementation
function decodeSimpleString(value: Buffer, readIndex: number): DecodeResult {
  const simpleStringTerm = value.indexOf(CRLF, readIndex); 
  const simpleString = value.toString('utf8', readIndex, simpleStringTerm);

  return {
    value: simpleString,
    readIndex: simpleStringTerm + CRLF.length
  };
};

// TODO: clean up implementation
function decodeBulkString(value: Buffer, readIndex: number): DecodeResult {
  const bytesTerm = value.indexOf(CRLF, readIndex); 
  const bytes = parseInt(value.toString('utf8', readIndex, bytesTerm), 10);
  readIndex = bytesTerm + CRLF.length;

  if (bytes === -1) {
    return null;
  }

  const bulkString = value.toString('utf8', readIndex, readIndex + bytes);

  return {
    value: bulkString,
    readIndex: readIndex + bytes + CRLF.length 
  };
};

// TODO: clean up implementation
function decodeArray(value: Buffer, readIndex: number): DecodeResult {
  const countTerm = value.indexOf(CRLF, readIndex);
  const count = Number(value.toString('utf8', readIndex, countTerm));
  readIndex = countTerm + CRLF.length;

  const elements = [];
  for (let i = 0; i < count; i++) {
    const token = parse(value, readIndex);
    readIndex = token.readIndex;
    elements.push(token.value);
  }

  return {
    value: elements,
    readIndex: readIndex
  };
}
