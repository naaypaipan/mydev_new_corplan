/* eslint-disable no-magic-numbers */
require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  isProduction: process.env.NODE_ENV === "production",
  apiVersion: process.env.API_VERSION || 1,
  token_exp_days: process.env.TOKEN_EXP_DAYS || 90,
  secret:
    process.env.NODE_ENV === "production"
      ? process.env.SECRET
      : "piyawat-transport",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/iarc",
  pageLimit: process.env.PAGE_LIMIT || 1000,
  gcsBucket: process.env.GCS_BUCKET || "",
  gcsProjectId: process.env.GCS_PROJECT_ID || "",
  lineNotifyClientId: process.env.LINE_NOTIFY_CLIENT_ID || "",
  lineNotifyClientSecret: process.env.LINE_NOTIFY_CLIENT_SECRET || "",
  lineNotifyRedirectURL: process.env.LINE_NOTIFY_REDIRECT_URL || "",
  lineNotifyClientIdTimestamp:
    process.env.LINE_NOTIFY_CLIENT_ID_TIMESTAMP || "",
  lineNotifyClientSecretTimestamp:
    process.env.LINE_NOTIFY_CLIENT_SECRET_TIMESTAMP || "",
  lineNotifyRedirectURLTimestamp:
    process.env.LINE_NOTIFY_REDIRECT_URL_TIMESTAMP || "",
  discordWebhookTimestamp: process.env.DISCORD_WEBHOOK_TIMESTAMP || "",
  discordWebhookDailyReport: process.env.DISCORD_WEBHOOK_DAILY_REPORT || "",
  googleSheetId: process.env.GOOGLE_SHEET_ID || "",
};
