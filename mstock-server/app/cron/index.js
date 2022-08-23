const CronJob = require("node-cron");

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("0 */1 * * *", () => {
    console.log("I'm executed on every 5 min!", Date.now().toISOString());
  });

  scheduledJobFunction.start();
}