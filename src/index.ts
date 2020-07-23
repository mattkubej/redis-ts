import { createServer } from 'net';
import { decode } from './resp-decoder';
import { handle } from './command-handler';

const server = createServer();

server.on('connection', function(socket) {
  socket.on('data', function(data) {
    try {
      const cmd = decode(data);
      handle(socket, cmd);
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(3000, function() {
  console.log('listening on 3000');
});
