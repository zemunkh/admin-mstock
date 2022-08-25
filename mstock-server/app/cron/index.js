const CronJob = require("node-cron");

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("0 */1 * * *", () => {
    var now = new Date();
    console.log("I'm executed on every 2 hour!", now.toISOString());
  });

  scheduledJobFunction.start();
}