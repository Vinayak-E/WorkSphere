import  connectDb  from "./configs/db.config";

import app from "./app";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDb(); 
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
