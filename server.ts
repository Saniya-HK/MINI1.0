import express from "express";
import path from "path";
import { routes } from "./server/routes.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  // Serve JSON parser
  app.use(express.json());
  
  // Register unified API routing
  app.use(routes);

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode (Vite Middleware active)...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Express routes Vite middleware
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode (Static Build assets serving)...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static frontend folder
    app.use(express.static(distPath));
    
    // Serve SPA index.html for any remaining route addresses
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Smart Career Advisor server is listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical error starting Express Full-Stack server:", error);
});
