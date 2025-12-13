import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: ".env" }); // or .env.local

import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
