import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, pool } from "./config/db.js";

async function main(): Promise<void> {
  try {
    await connectDatabase();
    const server = app.listen(env.PORT, () => {
      console.info(`Backend: http://localhost:${env.PORT}`);
    });

    let closing = false;
    const shutdown = (signal: string): void => {
      if (closing) return;
      closing = true;
      console.info(`${signal} received; closing connections...`);
      server.close(async (error) => {
        try {
          await pool.end();
          if (error) throw error;
          console.info("Shutdown complete");
        } catch (failure) {
          console.error("Shutdown error:", failure);
          process.exitCode = 1;
        }
      });
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Backend startup failed:", error instanceof Error ? error.message : "Unknown error");
    await pool.end();
    process.exitCode = 1;
  }
}
void main();
