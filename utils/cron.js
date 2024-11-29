import cron from 'node-cron';
import { runTask } from './task.js';
export const startCronJob = () => {
    cron.schedule('*/2 * * * *', () => {
        console.log("cronjob Triggered");
        runTask();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set timezone to India/Kolkata (IST)
    });
};