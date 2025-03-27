const { eventQueue } = require("../config/redis");

exports.scheduleNotification = async (event) => {
  const eventTime = new Date(event.date).getTime();
  const notificationTime = eventTime - 30 * 60 * 1000; // 30 minutes before event

  await eventQueue.add("notify", { eventId: event._id, eventName: event.name }, { delay: notificationTime - Date.now() });
};
