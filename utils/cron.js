import cron from 'node-cron';
import { runTask, runReply, runFandom } from './task.js';
export const startCronJob = () => {
    cron.schedule('*/30 * * * *', () => {
        console.log("cronjob Triggered");
        runTask();
        runReply();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set timezone to India/Kolkata (IST)
    });
    // cron.schedule('* * * * *', () => {
    //     console.log("cronjob Triggered");
    //     runFandom();
    // }, {
    //     scheduled: true,
    //     timezone: "Asia/Kolkata" // Set timezone to India/Kolkata (IST)
    // })
};

