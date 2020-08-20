import RedisServer from './server';

const redisServer = new RedisServer();

// TODO: test this
const port = parseInt(String(process.env.PORT), 10) || 6379;

redisServer.listen(port, function () {
  console.log(`listening on ${port}`);
});
