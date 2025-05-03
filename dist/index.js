// server/index.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
var port = process.env.PORT || 5e3;
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist/public")));
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/public/index.html"));
  });
}
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
export {
  db
};
