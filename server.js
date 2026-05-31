import app from './app.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';

connectDb().then(() => {
    app.listen(env.PORT, () => {
});
}).catch((err) => {
    console.error('Database connection failed', err);
});

