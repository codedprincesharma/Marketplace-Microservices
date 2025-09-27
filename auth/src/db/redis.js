// Provide a test-safe in-memory stub when running tests so we don't connect
// to a production Redis instance. In non-test environments, create a real
// ioredis client.
const isTest = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined'

if (isTest) {
  // Simple in-memory Redis-like stub sufficient for typical set/get/del usage
  const store = new Map()

  const redisMock = {
    async set(key, value, mode, duration) {
      // Support both set(key, value) and set(key, value, 'EX', seconds)
      if (mode === 'EX' && typeof duration === 'number') {
        store.set(key, value)
        // set a timeout to delete the key; unref the timer so it won't keep
        // the Node process alive during tests
        const t = setTimeout(() => store.delete(key), duration * 1000)
        if (t && typeof t.unref === 'function') t.unref()
        return 'OK'
      }
      store.set(key, value)
      return 'OK'
    },
    async get(key) {
      return store.has(key) ? store.get(key) : null
    },
    async del(key) {
      return store.delete(key) ? 1 : 0
    },
    // minimal event emitter stub
    on() { },
    quit: async () => { },
  }

  module.exports = redisMock
} else {
  const Redis = require('ioredis')

  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  })

  redis.on('connect', () => {
    console.log('Connected to Redis')
  })

  module.exports = redis
}

