import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function localDbPlugin() {
  const dbFile = path.resolve(__dirname, ".tierforge_dev_db.json");

  function readDb() {
    try {
      if (fs.existsSync(dbFile)) {
        return JSON.parse(fs.readFileSync(dbFile, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading dev db:", e);
    }
    return { users: [], tierlists: [], categories: [], comments: [] };
  }

  function writeDb(data) {
    try {
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing dev db:", e);
    }
  }

  return {
    name: "tierforge-local-db",
    configureServer(server) {
      server.middlewares.use("/api/db", (req, res, next) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          return res.end();
        }

        if (req.method === "GET") {
          const current = readDb();
          return res.end(JSON.stringify(current));
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const payload = JSON.parse(body || "{}");
              const current = readDb();
              const updated = {
                ...current,
                ...payload,
              };
              writeDb(updated);
              return res.end(JSON.stringify({ success: true, data: updated }));
            } catch (err) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localDbPlugin()],
  server: { port: 5173 },
});
