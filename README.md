# redis-ts

Limited feature implementation of [Redis](https://redis.io/) in TypeScript.

Communicates with clients utilizing [RESP](https://redis.io/topics/protocol) (i.e. redis-client).

## Supported Commands

* COMMAND
* ECHO
* GET
* PING
* QUIT
* SET (supports nx and xx)
