const express = require('express');
const errorMiddleware = require('./src/middlewares/error-middleware');
const {leaguesModule} = require("./src/modules/leagues");
const {weekendLeaguesModule} = require("./src/modules/weekend_leagues");


const PORT = process.env.PORT || 8010;

const app = express();

app.use(express.urlencoded({limit: '50mb', extended: false})); // для парсинга query string
app.use(express.json({limit: '50mb'})); // для парсинга json
app.use(express.static('public'));


app.use('/api/auth', require('./src/routes/auth.router'));
app.use('/api/user', require('./src/routes/user.router'));
app.use('/api/server', require('./src/routes/server.router'));
app.use('/api/league', require('./src/routes/league.router'));
app.use('/api/match', require('./src/routes/match.router'));
app.use('/api/weekend_tournament', require('./src/routes/weekend_tournament.router'));
app.use('/api/debug', require('./src/routes/debug.router'));
app.use('/api/admin', require('./src/routes/admin.router'));
app.use(errorMiddleware);

app.listen(PORT, async () => {
    await leaguesModule();
    await weekendLeaguesModule();

    console.log(`(server.js) Server is listening on port ${PORT}`);
});