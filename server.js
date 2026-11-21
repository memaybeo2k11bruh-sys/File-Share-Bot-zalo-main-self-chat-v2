
import fs from "node:fs";
import { timingSafeEqual } from "node:crypto";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LISTEN_RETRY_MAX_MS = 2_000;
const LISTEN_RETRY_INTERVAL_MS = 500;

let sharedApp = null;
let activeServer = null;
let startPromise = null;

function createServer(bot, config) {
  const app = express();

  app.locals.bot = bot || null;
  app.locals.config = config || bot?.config || null;

  // Xem QR đăng nhập Zalo có bảo vệ bằng token
  app.get("/login-qr.png", (req, res) => {
    const expectedToken = process.env.QR_VIEW_TOKEN;
    const providedToken =
      typeof req.query.token === "string" ? req.query.token : "";

    if (!expectedToken) {
      return res.status(503).send("QR viewer chưa được cấu hình.");
    }

    const expected = Buffer.from(expectedToken);
    const provided = Buffer.from(providedToken);

    if (
      expected.length !== provided.length ||
      !timingSafeEqual(expected, provided)
    ) {
      return res.status(403).send("Không có quyền xem QR.");
    }

   const configuredPath = app.locals.config?.qrPath;

const qrPath = configuredPath
  ? path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath)
  : path.join(process.cwd(), "login-qr.png");

console.log("[QR Viewer] Đường dẫn đang kiểm tra:", qrPath);
console.log("[QR Viewer] File tồn tại:", fs.existsSync(qrPath));

if (!fs.existsSync(qrPath)) {
  return res.status(404).send("Chưa có ảnh QR.");
}

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Content-Type", "image/png");

    return res.sendFile(qrPath);
  });

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/api/health", (req, res) => {
    const bot = app.locals.bot;

    if (!bot) {
      return res.json({ status: "waiting_for_login" });
    }

    res.json({
      status: "online",
      botName: bot.config.botName,
      uptimeMs: Date.now() - bot.config.startedAt,
    });
  });

  app.get("/api/stats", (req, res) => {
    const bot = app.locals.bot;

    if (!bot) {
      return res.status(503).json({ error: "Bot chưa đăng nhập." });
    }

    try {
      const userCount =
        bot.db.query("SELECT COUNT(*) AS c FROM users")[0]?.c ?? 0;
      const groupCount =
        bot.db.query("SELECT COUNT(*) AS c FROM groups")[0]?.c ?? 0;

      res.json({
        botName: bot.config.botName,
        prefix: bot.config.botPrefix,
        uptimeMs: Date.now() - bot.config.startedAt,
        commandCount: bot.commands.size,
        userCount,
        groupCount,
      });
    } catch {
      res.status(500).json({ error: "Không lấy được thống kê." });
    }
  });

  app.get("/api/commands", (req, res) => {
    const bot = app.locals.bot;

    if (!bot) {
      return res.status(503).json({ error: "Bot chưa đăng nhập." });
    }

    const list = [...bot.commands.values()].map((c) => ({
      name: c.name,
      description: c.description,
      group: c.group,
      role: c.role,
      cooldown: c.cooldown,
      aliases: c.aliases,
    }));

    res.json({ commands: list });
  });

  return app;
}

function listenOnce(app, port, host, logger) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host);

    server.once("listening", () => {
      logger.info(`[Dashboard] Đang chạy tại http://${host}:${port}`);
      resolve(server);
    });

    server.once("error", reject);
  });
}

async function startServer(bot, logger, configOverride) {
  if (!sharedApp) {
    sharedApp = createServer(bot, configOverride);
  } else {
    if (bot) sharedApp.locals.bot = bot;
    if (bot?.config) {
      sharedApp.locals.config = bot.config;
    } else if (configOverride) {
      sharedApp.locals.config = configOverride;
    }
  }

  if (activeServer) return activeServer;
  if (startPromise) return startPromise;

  const port = Number(
    process.env.PORT || sharedApp.locals.config?.port || 3000
  );

  startPromise = listenOnce(sharedApp, port, "0.0.0.0", logger);

  try {
    activeServer = await startPromise;
    return activeServer;
  } finally {
    startPromise = null;
  }
}

export { createServer, startServer };
