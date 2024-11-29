import cron from 'node-cron';
import { runTask,runReply } from './task.js';
export const startCronJob = () => {
    cron.schedule('*/15 * * * *', () => {
        console.log("cronjob Triggered");
        runTask();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set timezone to India/Kolkata (IST)
    });

    cron.schedule('*/15 * * * *', () => {
        console.log("cronjob Triggered");
        runReply();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set timezone to India/Kolkata (IST)
    });
};

