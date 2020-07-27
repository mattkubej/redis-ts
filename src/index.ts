import { createServer } from 'net';
import { decode } from './resp-decoder';
import { handle } from './command-handler';

const server = createServer();

server.on('connection', function(socket) {
  socket.on('data', function(data) {
    try {
      // TODO: consider changing this
      //       - invoke decode within handle
      //       - rename command handler to request handler
      const request = decode(data);
      handle(socket, request);
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(6379, function() {
  console.log('listening on 6379');
});
