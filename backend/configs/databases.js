const mongoose = require("mongoose");

const config = require("./app");

const databases = {
  mongoDB() {
    console.log(config.mongodbUri);
    const db = mongoose.connect(
      config.mongodbUri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        retryWrites: false,
      },
      (error) => {
        if (error) {
          console.error("MongoDB error: ", error);
        }
        console.log("MongoDB connected");
      }
    );
    return db;
  },
};

module.exports = databases.mongoDB();
