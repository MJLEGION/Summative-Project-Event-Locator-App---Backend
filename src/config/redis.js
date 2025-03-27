const { Queue, Worker } = require("bullmq");

const redisOptions = { connection: { host: "127.0.0.1", port: 6379 } };

// Create a job queue
const eventQueue = new Queue("eventQueue", redisOptions);

module.exports = { eventQueue, Worker, redisOptions };
