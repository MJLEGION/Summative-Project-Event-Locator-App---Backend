const { eventQueue } = require("../config/redis");

exports.scheduleNotification = async (event) => {
  const eventTime = new Date(event.date).getTime();
  const notificationTime = eventTime - 30 * 60 * 1000; // 30 minutes before event

  // Log the scheduling details
  console.log(`Scheduling notification for event: ${event.name}`);
  console.log(`Event time: ${new Date(eventTime)}`);
  console.log(`Notification time: ${new Date(notificationTime)}`);

  await eventQueue.add("notify", { 
    eventId: event._id, 
    eventName: event.name 
  }, { 
    delay: Math.max(0, notificationTime - Date.now()) 
  });
};