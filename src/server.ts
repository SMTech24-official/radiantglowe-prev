import mongoose from "mongoose";
import  server  from "./app";
import config from "./app/config";
import { seedSuperAdmin } from "./app/Db";

async function main() {
  try {
    await mongoose.connect(config.MongoURI as string);
    console.log("MongoDB connected");
    await seedSuperAdmin();
    server.listen(config.Port, () => {
      console.log(`Server running on port ${config.Port}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

main();