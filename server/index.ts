import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Database setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist/public")));
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// SPA fallback in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/public/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 