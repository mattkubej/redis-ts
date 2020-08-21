import RedisServer from '../server';
import { createConnection, Server, Socket } from 'net';
import * as cmd from '../cmd';
import * as decoder from '../resp/decoder';

jest.mock('../cmd/echo');
jest.mock('../cmd/get');
jest.mock('../cmd/ping');
jest.mock('../cmd/quit');
jest.mock('../cmd/set');

describe('server', () => {
  let redisServer: RedisServer;
  let server: Server;
  let client: Socket;
  let request: Promise<Buffer>;
  const writeMock: jest.Mock = jest.fn();

  beforeEach(async () => {
    redisServer = new RedisServer();
    server = redisServer.listen(3999);

    request = new Promise((resolve) => {
      server.on('connection', (socket) => {
        socket.write = writeMock;
        socket.on('data', resolve);
      });
    });

    client = await new Promise((resolve) => {
      const c = createConnection(3999, '127.0.0.1', () => {
        resolve(c);
      });
    });
  });

  afterEach(() => {
    client.destroy();
    server.close();
    jest.clearAllMocks();
  });

  it('should invoke the echo command with a echo request', async () => {
    client.write(Buffer.from('*2\r\n$4\r\nECHO\r\n$4\r\ntest\r\n'));
    await request;

    const mockExecute = (cmd.Echo as jest.Mock).mock.instances[0].execute.mock;
    const executeClient = mockExecute.calls[0][0];
    const executeRequest = mockExecute.calls[0][1];

    expect(executeClient instanceof Socket).toBeTruthy();
    expect(executeClient.server).toBe(server);
    expect(executeRequest).toStrictEqual(['ECHO', 'test']);
  });

  it('should invoke the get command with a get request', async () => {
    client.write(Buffer.from('*2\r\n$3\r\nGET\r\n$4\r\ntest\r\n'));
    await request;

    const mockExecute = (cmd.Get as jest.Mock).mock.instances[0].execute.mock;
    const executeClient = mockExecute.calls[0][0];
    const executeRequest = mockExecute.calls[0][1];

    expect(executeClient instanceof Socket).toBeTruthy();
    expect(executeClient.server).toBe(server);
    expect(executeRequest).toStrictEqual(['GET', 'test']);
  });

  it('should invoke the ping command with a ping request', async () => {
    client.write(Buffer.from('*2\r\n$4\r\nPING\r\n$4\r\ntest\r\n'));
    await request;

    const mockExecute = (cmd.Ping as jest.Mock).mock.instances[0].execute.mock;
    const executeClient = mockExecute.calls[0][0];
    const executeRequest = mockExecute.calls[0][1];

    expect(executeClient instanceof Socket).toBeTruthy();
    expect(executeClient.server).toBe(server);
    expect(executeRequest).toStrictEqual(['PING', 'test']);
  });

  it('should invoke the quit command with a quit request', async () => {
    client.write(Buffer.from('*1\r\n$4\r\nQUIT\r\n'));
    await request;

    const mockExecute = (cmd.Quit as jest.Mock).mock.instances[0].execute.mock;
    const executeClient = mockExecute.calls[0][0];
    const executeRequest = mockExecute.calls[0][1];

    expect(executeClient instanceof Socket).toBeTruthy();
    expect(executeClient.server).toBe(server);
    expect(executeRequest).toStrictEqual(['QUIT']);
  });

  it('should invoke the set command with a set request', async () => {
    client.write(Buffer.from('*2\r\n$3\r\nSET\r\n$4\r\ntest\r\n'));
    await request;

    const mockExecute = (cmd.Set as jest.Mock).mock.instances[0].execute.mock;
    const executeClient = mockExecute.calls[0][0];
    const executeRequest = mockExecute.calls[0][1];

    expect(executeClient instanceof Socket).toBeTruthy();
    expect(executeClient.server).toBe(server);
    expect(executeRequest).toStrictEqual(['SET', 'test']);
  });

  it('should reply with an error when receiving an ill-formed request', async () => {
    client.write(Buffer.from('$4\r\nFAKE\r\n'));
    await request;

    expect(writeMock).toBeCalledWith('-ERR ill-formed request\r\n');
  });

  it('should reply with an error when receiving an unknown command', async () => {
    client.write(Buffer.from('*1\r\n$4\r\nFAKE\r\n'));
    await request;

    expect(writeMock).toBeCalledWith("-ERR unknown command 'FAKE'\r\n");
  });

  it('should reply with an error when a positive arity does not exactly match request length', async () => {
    (cmd.Echo as jest.Mock).mock.instances[0].arity = 2;
    (cmd.Echo as jest.Mock).mock.instances[0].name = 'echo';

    client.write(Buffer.from('*1\r\n$4\r\nECHO\r\n'));
    await request;

    expect(writeMock).toBeCalledWith(
      "-ERR wrong number of arguments for 'echo' command\r\n"
    );
  });

  it('should reply with an error when the request length is less than the absolute value of arity', async () => {
    (cmd.Set as jest.Mock).mock.instances[0].arity = -3;
    (cmd.Set as jest.Mock).mock.instances[0].name = 'set';

    client.write(Buffer.from('*2\r\n$3\r\nSET\r\n$3\r\nkey\r\n'));
    await request;

    expect(writeMock).toBeCalledWith(
      "-ERR wrong number of arguments for 'set' command\r\n"
    );
  });

  it('should reply with an error when failing to decode a request', async () => {
    const spy = jest.spyOn(decoder, 'decode').mockImplementation(() => {
      throw new Error('failed to decode request');
    });

    client.write(Buffer.from('*1\r\n$4\r\nFAKE\r\n'));
    await request;

    expect(writeMock).toBeCalledWith('-ERR failed to decode request\r\n');
    spy.mockRestore();
  });

  it('should reply with a generic error when handleRequest fails with an error without a message', async () => {
    (cmd.Ping as jest.Mock).mock.instances[0].execute.mockImplementation(() => {
      throw new Error();
    });

    client.write(Buffer.from('*1\r\n$4\r\nPING\r\n'));
    await request;

    expect(writeMock).toBeCalledWith('-ERR unexpected error\r\n');
  });

  it('should write an error to stderr when client.write fails', async () => {
    (cmd.Ping as jest.Mock).mock.instances[0].execute.mockImplementation(() => {
      throw new Error();
    });

    const spy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('socket failure');
    writeMock.mockImplementation(() => {
      throw error;
    });

    client.write(Buffer.from('*1\r\n$4\r\nPING\r\n'));
    await request;

    expect(console.error).toBeCalledWith(
      "failed to handle request 'socket failure'"
    );
    spy.mockRestore();
  });

  it('should write a generic error to stderr when client.write fails without a message', async () => {
    (cmd.Ping as jest.Mock).mock.instances[0].execute.mockImplementation(() => {
      throw new Error();
    });

    const spy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error();
    writeMock.mockImplementation(() => {
      throw error;
    });

    client.write(Buffer.from('*1\r\n$4\r\nPING\r\n'));
    await request;

    expect(console.error).toBeCalledWith(
      "failed to handle request 'unexpected error'"
    );
    spy.mockRestore();
  });
});
