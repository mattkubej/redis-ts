import RedisServer from '../server';
import { createConnection, Server, Socket } from 'net';
import Echo from '../cmd/echo';

jest.mock('../cmd/echo');

describe('server', () => {
  let redisServer: RedisServer;
  let server: Server;
  let client: Socket;

  beforeAll(() => {
    redisServer = new RedisServer();
    server = redisServer.listen(3999);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    client.destroy();
    server.close();
  });

  it('should invoke the echo command with a echo request', async () => {
    const request = new Promise((resolve) => {
      server.on('connection', (socket) => {
        socket.on('data', resolve);
      });
    });

    client = await new Promise((resolve) => {
      const c = createConnection(3999, '127.0.0.1', () => {
        resolve(c);
      });
    });

    client.write(Buffer.from('*1\r\n$4\r\nECHO\r\n'));
    await request;

    const mockExecute = (Echo as jest.Mock).mock.instances[0].execute.mock;
    const executeClient = mockExecute.calls[0][0];
    const executeRequest = mockExecute.calls[0][1];

    expect(executeClient instanceof Socket).toBeTruthy();
    expect(executeClient.server).toBe(server);
    expect(executeRequest).toStrictEqual(['ECHO']);
  });
});
