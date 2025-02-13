import connectDb from "./configs/db.config";
import { createServer } from "http";
import app from "./app";
import { initializeSocket } from "./socket/socket";

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDb(); 

  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
