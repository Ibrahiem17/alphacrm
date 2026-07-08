import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import contactsRouter from './routes/contacts.routes.js';
import dealsRouter from './routes/deals.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/deals', dealsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
