import mongoose from "mongoose";
import { envConfig } from "./envConfig";

const MONGO_URI = envConfig.MONGODB_URI || "mongodb://localhost:27017/MainDB";

export default async () => {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MainDB connected successfully"))
    .catch((err) => console.log("Database connection error:", err));
};


export const connectTenantDB = async (tenantId: string) => {
  const tenantDBURI = `${MONGO_URI.replace("WorkShere", tenantId)}`;
  const tenantConnection = mongoose.createConnection(tenantDBURI);

  tenantConnection.on("connected", () =>
    console.log(`Connected to tenant database: ${tenantId}`)
  );

  return tenantConnection;
};
