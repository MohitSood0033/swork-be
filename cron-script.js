const cron = require('node-cron');
const moment = require('moment');

const subscriptionStartTime = moment('29/06/2023 02:40:00'); // Set the subscription start time
const subscriptionEndTime = moment('29/06/2023 02:41:00'); // Set the subscription end time

// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
  const currentTime = moment();

  if (currentTime >= subscriptionStartTime && currentTime < subscriptionEndTime) {
    console.log(subscriptionStartTime);
    // Subscription is active
    console.log('Subscription is active.');
  } else if (currentTime >= subscriptionEndTime) {
    // Subscription has ended, send message
    console.log(subscriptionStartTime);
    console.log("Subscription has ended")
  }
}, {
  timezone: 'Asia/Kolkata' // Adjust timezone as per your requirement
});