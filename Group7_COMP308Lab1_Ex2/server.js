import config from "./config/config.js";
import app from "./server/express.js";
import mongoose from "mongoose";
mongoose.Promise = global.Promise;
console.log("==================================");
console.log("📡 Attempting to connect to MongoDB");
console.log("==================================");
console.log("URI:", config.mongoUri);
console.log("Database:", config.mongoUri.split('/').pop().split('?')[0]);
console.log("==================================");
mongoose
  .connect(config.mongoUri, {
    //useNewUrlParser: true,
    //useCreateIndex: true,
    //useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ Successfully connected to MongoDB!");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
  });
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  throw new Error(`unable to connect to database: ${config.mongoUri}`);
});
app.get("/", (req, res) => {
  res.json({ message: "Welcome to User application." });
});
app.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("Server started on port %s.", config.port);
});
