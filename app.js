const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const responseTime = require("koa-response-time");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const path = require("path");

const app = new Koa();
const router = new Router();

// Middleware untuk catat waktu respon (di ctx.response.get('X-Response-Time'))
app.use(responseTime());
app.use(logger());
app.use(bodyParser());

// Serve static files (jika perlu)
app.use(serve(path.join(__dirname, "public")));

// Middleware: tambahkan ctx.ping untuk semua request
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
  ctx.ping = ms;
});

// Route: /ping dan /
const sendHealth = (ctx) => {
  ctx.body = {
    status: "ok",
    ping: ctx.ping,
  };
};

router.get("/ping", sendHealth);
router.get("/", sendHealth);

// Route API lainnya
const routes = require("./routes");
router.use("/api", routes.routeApi.routes());

app.use(router.routes()).use(router.allowedMethods());

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
