const Redis = require("ioredis");
const { Queue, Worker } = require("bullmq");

// Create Redis connection
const redisConnection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null  // Add this line to resolve the error
});

// Create a job queue
const eventQueue = new Queue("event-notifications", { connection: redisConnection });

module.exports = { 
  redisConnection, 
  eventQueue
};