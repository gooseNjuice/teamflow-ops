import 'dotenv/config';
import { app } from './app.ts';
import { connectDatabase } from './config/database.ts';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error(error);
    process.exit(1);
  }
}

startServer();
