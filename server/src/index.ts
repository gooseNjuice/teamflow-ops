import 'dotenv/config';
import { app } from './app.ts';
import { connectDatabase } from './config/database.ts';
import { seedProjects } from './seed/seedProjects.ts';
import { seedTasks } from './seed/seedTasks.ts';
import { seedUsers } from './seed/seedUsers.ts';
import { validateJwtConfig } from './utils/jwt.ts';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    validateJwtConfig();
    await connectDatabase();
    await seedUsers();
    await seedProjects();
    await seedTasks();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      console.error('Server startup failed: JWT_SECRET is not configured.');
    } else {
      console.error('MongoDB connection failed.');
    }

    console.error(error);
    process.exit(1);
  }
}

startServer();
