const { Worker } = require("bullmq");
const { redisConnection } = require("../config/redis");

const notificationWorker = new Worker(
  "event-notifications", 
  async (job) => {
    try {
      const { eventId, eventName } = job.data;
      console.log(`🔔 Notification triggered for event: ${eventName}`);
      console.log(`Event ID: ${eventId}`);
    } catch (error) {
      console.error("Notification processing error:", error);
    }
  },
  { 
    connection: redisConnection 
  }
);

notificationWorker.on('completed', (job) => {
  console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Notification job ${job.id} failed:`, err);
});

module.exports = notificationWorker;