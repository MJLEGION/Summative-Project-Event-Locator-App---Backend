const { Worker, redisOptions } = require("../config/redis");

const notificationWorker = new Worker("eventQueue", async (job) => {
  console.log(`📢 Sending notification for event: ${job.data.eventName}`);
  // Here, you can send an email/SMS notification
}, redisOptions);

console.log("✅ Notification worker started");
