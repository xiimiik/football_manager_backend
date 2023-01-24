const express = require("express");
const errorMiddleware = require("./middlewares/error-middleware");
const { leaguesModule } = require("./modules/leagues");
const { weekendLeaguesModule } = require("./modules/weekend_leagues");

const serverless = require("serverless-http");

const PORT = process.env.PORT || 8010;

const app = express();

app.use(express.urlencoded({ limit: "50mb", extended: false })); // для парсинга query string
app.use(express.json({ limit: "50mb" })); // для парсинга json
app.use(express.static("public"));

app.use("/api/auth", require("./routes/auth.router"));
app.use("/api/user", require("./routes/user.router"));
app.use("/api/server", require("./routes/server.router"));
app.use("/api/league", require("./routes/league.router"));
app.use("/api/match", require("./routes/match.router"));
app.use(
  "/api/weekend_tournament",
  require("./routes/weekend_tournament.router")
);
app.use("/api/debug", require("./routes/debug.router"));
app.use("/api/admin", require("./routes/admin.router"));
app.use(errorMiddleware);

app.listen(PORT, async () => {
  await leaguesModule();
  await weekendLeaguesModule();

  console.log(`(server.js) Server is listening on port ${PORT}`);
});

module.exports.handler = serverless(app);
