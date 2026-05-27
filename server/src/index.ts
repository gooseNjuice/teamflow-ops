import { app } from './app.ts';

const PORT = process.env.PORT || 4040;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});