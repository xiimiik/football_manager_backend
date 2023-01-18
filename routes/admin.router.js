const {Router} = require('express');
const fileHandle = require('fs/promises');
const path = require('path');
const {google} = require('googleapis');
const {prisma, Prisma} = require("../prisma-client");
const ApiError = require("../exceptions/api-error");
const {avatarDefying} = require("../data/avatars");
const {generateStartCardsSet} = require("../modules/players");
const {
    playMatchManyTimes_vc,
    playMatchManyTimes_v_12_08_2022,
    playMatchManyTimes_v_12_08_2022_2, playMatchManyTimes_v_16otr_v1, composePlayersArray, calculatePlayersTotalAsm,
    calculatePlayerAsm, playMatchManyTimes_v_17otr_v1, timeWasted, playDebugMatch_17otr_v2, playMatchManyTimes_17otr_v2,
    playMatchManyTimes_17otr_v3_09I19
} = require("../utils/debug.utils");

const AdminApiRouter = Router();

// servers ===============================================================================
AdminApiRouter.get('/game_servers', async (req, res, next) => {
    try {
        let servers = await prisma.game_server.findMany({
            select: {
                id: true,
                region: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.json({
            message: 'Список серверов:',
            details: {
                servers
            }
        });
    }
    catch (e) {
        next(e);
    }
});

AdminApiRouter.get('/game_server/:id/countries', async (req, res, next) => {
    try {
        let gameServerId = +req.params.id,
            gameServer = await prisma.game_server.findFirst({
                select: {
                    id: true,
                    region: {
                        select: {
                            countries: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    },
                },
                where: {
                    id: gameServerId
                }
            });

        if (!gameServer) {
            throw ApiError.BadRequest('Сервер с таким id не был найден!');
        }

        res.json({
            message: `Список стран сервера #${gameServerId}:`,
            details: {
                countries: gameServer.region.countries
            }
        });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientValidationError) {
            e = ApiError.BadRequest('Id сервера состоит только из цифр!');
        }
        next(e);
    }
});

AdminApiRouter.get('/game_server/:server_id/country/:country_id/leagues', async (req, res, next) => {
    try {
        let gameServerId = +req.params.server_id,
            countryId = +req.params.country_id,
            countryLeagues = await prisma.league_tmp.findMany({
                select: {
                    id: true,
                    isFull: true,
                    level: true,
                },
                where: {
                    server_id: gameServerId,
                    country_id: countryId,
                }
            });

        if (!countryLeagues.length) {
            throw ApiError.BadRequest('Лиги такого сервера и страны не были найдены...');
        }

        res.json({
            message: `Список лиг страны #${countryId} сервера #${gameServerId}:`,
            details: {
                countryLeagues
            }
        });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientValidationError) {
            e = ApiError.BadRequest('Id сервера/страны состоит только из цифр!');
        }
        next(e);
    }
});

AdminApiRouter.get('/league/:league_id/users', async (req, res, next) => {
    try {
        let leagueId = +req.params.league_id,
            league = await prisma.league_tmp.findFirst({
                select: {
                    leaguePlayers: {
                        select: {
                            player: {
                                select: {
                                    id: true,
                                    name: true,
                                    abbr: true,
                                    logo: true,
                                }
                            }
                        }
                    }
                },
                where: {
                    id: leagueId
                }
            });

        if (!league) {
            throw ApiError.BadRequest('Такая лига не была найдена...');
        }

        res.json({
            message: `Список юзеров лиги #${leagueId}:`,
            details: {
                leagueUsers: league.leaguePlayers
            }
        });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientValidationError) {
            e = ApiError.BadRequest('Id лиги состоит только из цифр!');
        }
        next(e);
    }
});
// servers ===============================================================================


// matches ===============================================================================
AdminApiRouter.get('/usersIds', async (req, res) => {
    let usersRows = await prisma.user.findMany({
            select: {
                id: true,
                lastTeam: true,
                players: {
                    select: {
                        playersJson: true
                    }
                }
            }
        }),
        users = [];

    usersRows.forEach(userRow => {
        let user = {
            id: userRow.id,
            lastTeam: JSON.parse(userRow.lastTeam),
            allPlayers: JSON.parse(userRow.players.playersJson),
            players: []
        };
        user.players = composePlayersArray(user.lastTeam, user.allPlayers);
        users.push({
            id: user.id,
            playersASM: calculatePlayersTotalAsm(user.players),
        });
    });

    res.json({
        players: users
    });
});

AdminApiRouter.get('/userMatches/:id', async (req, res) => {
    let id = Number(req.params.id);

    let matches = await prisma.match.findMany({
        select: {
            id: true,
            player1: {
                select: {
                    id: true,
                    avatar: true,
                    lastTactic: true,
                    lastTeam: true,
                    players: {
                        select: {
                            playersJson: true
                        }
                    }
                },
            },
            player2: {
                select: {
                    id: true,
                    avatar: true,
                    lastTactic: true,
                    lastTeam: true,
                    players: {
                        select: {
                            playersJson: true
                        }
                    }
                },
            },
        },
        where: {
            OR: [
                {
                    player1Id: id
                },
                {
                    player2Id: id
                },
            ]
        },
        orderBy: {
            time: 'asc'
        }
    });

    let debugLogs = []; //d

    matches.forEach((match) => {
        let T_players = [0, 0], //d
            T_players_bonuses = [0, 0], //d
            T_players_bonuses_adv = [0, 0],
            avatarBonuses = [0, 0]; //d


        let
            user1 = {
                id: match.player1.id,
                avatar: match.player1.avatar,
                tactic: JSON.parse(match.player1.lastTactic),
                lastTeam: JSON.parse(match.player1.lastTeam),
                allPlayers: JSON.parse(match.player1.players.playersJson),
                players: []
            },
            user2 = {
                id: match.player2.id,
                avatar: match.player2.avatar,
                tactic: JSON.parse(match.player2.lastTactic),
                lastTeam: JSON.parse(match.player2.lastTeam),
                allPlayers: JSON.parse(match.player2.players.playersJson),
                players: []
            },
            T = [0, 0];

        user1.players = composePlayersArray(user1.lastTeam, user1.allPlayers);
        user2.players = composePlayersArray(user2.lastTeam, user2.allPlayers);

        T[0] = calculatePlayersTotalAsm(user1.players);
        T[1] = calculatePlayersTotalAsm(user2.players);

        T_players[0] = T[0];//d
        T_players[1] = T[1];//d


        T[0] += 3; //доп очки за домашнюю тиму
        if (user1.avatar !== user2.avatar) {
            if (avatarDefying[user1.avatar].includes(user2.avatar)) {
                T[0] += 3;

                avatarBonuses[0] = 3;//d
            }
            else if (avatarDefying[user2.avatar].includes(user1.avatar)) {
                T[1] += 3;
                avatarBonuses[1] = 3;//d
            }
        } // доп очки за контр тренеров

        T_players_bonuses[0] = T[0];//d
        T_players_bonuses[1] = T[1];//d


        let advantage = Math.abs(T[0] - T[1]);
        if (advantage <= 5) {
            if (T[0] > T[1]) {
                T[1] = T[0];
            }
            else {
                T[0] = T[1];
            }
        }
        else if (advantage <= 8) {
            if (T[0] > T[1]) {
                T[0] += 3;
            }
            else {
                T[1] += 3;
            }
        }
        else {
            if (T[0] > T[1]) {
                T[0] += advantage;
            }
            else {
                T[1] += advantage;
            }
        }

        T_players_bonuses_adv[0] = T[0];//d
        T_players_bonuses_adv[1] = T[1];//d

        // debug ====================================================
        let user1PlayersASM = [], user2PlayersASM = [];
        for (let i = 0; i < user1.players.length; i++) {
            let player = user1.players[i];
            user1PlayersASM.push({
                playerId: player.playerId,
                playerName: player.playerName,
                asm: calculatePlayerAsm(player)
            });
        }

        for (let i = 0; i < user2.players.length; i++) {
            let player = user2.players[i];
            user2PlayersASM.push({
                playerId: player.playerId,
                playerName: player.playerName,
                asm: calculatePlayerAsm(player)
            });
        }

        debugLogs.push({
            matchId: match.id,
            user1: {
                id: user1.id,
                playersAsm: user1PlayersASM,
                homeBonus: 3,
                avatarBonus: avatarBonuses[0],
                T_players: T_players[0],
                T_players_bonuses: T_players_bonuses[0],
                T_players_bonuses_adv: T_players_bonuses_adv[0],
            },
            user2: {
                id: user2.id,
                playersAsm: user2PlayersASM,
                homeBonus: 0,
                avatarBonus: avatarBonuses[1],
                T_players: T_players[1],
                T_players_bonuses: T_players_bonuses[1],
                T_players_bonuses_adv: T_players_bonuses_adv[1],
            },
        });//d
    });

    res.json({
        matches: debugLogs
    });
});

AdminApiRouter.post('/matchResults', async (req, res) => {
    let version = req.body.version,
        matchId = Number(req.body.matchId),
        count = Number(req.body.count),
        saveToDb = req.body.saveToDb,
        playMatchManyTimesFn;

    switch (version) {
        case 'V7':
            playMatchManyTimesFn = playMatchManyTimes_17otr_v3_09I19;
            break;

        case 'V6':
            playMatchManyTimesFn = playMatchManyTimes_17otr_v2;
            break;

        case 'V5':
            playMatchManyTimesFn = playMatchManyTimes_v_17otr_v1;
            break;

        case 'V4':
            playMatchManyTimesFn = playMatchManyTimes_v_16otr_v1;
            break;

        case 'V3':
            playMatchManyTimesFn = playMatchManyTimes_vc;
            break;

        case 'V2':
            playMatchManyTimesFn = playMatchManyTimes_v_12_08_2022_2;
            break;

        case 'V1':
            playMatchManyTimesFn = playMatchManyTimes_v_12_08_2022;
            break;
    }

    let startMs = new Date();

    console.log(`==============================================\n(routes/admin.router.js) Started playing match #${matchId} ${count} times...`);
    let logs = await playMatchManyTimesFn(matchId, count, saveToDb);
    console.log(`(routes/admin.router.js) Playing match #${matchId} ${count} times took ${new Date() - startMs} ms...\n==============================================`);

    res.json({
        logs: JSON.stringify(logs)
    });
});
// matches ===============================================================================


//google sheets (parsers) ===============================================================================
AdminApiRouter.get('/gsheets_parser/parse', async (req, res, next) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(__dirname, '../config', 'gsheets-token.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();

        const spreadsheetId = '1iWUX1nRAR1VqKPzF6iXC9z8xQ5g8xDaXUxibSTUfVtU';

        const googleSheets = google.sheets({
            version: 'v4',
            auth: client
        });

        const rows = await googleSheets.spreadsheets.values.batchGet({
            auth,
            spreadsheetId,
            ranges: ['England!A1:F18', 'England!H1:M18', 'England!O1:T26', 'Spain!A1:F18', 'Spain!H1:M18', 'Spain!O1:T27']
        });

        const valueRanges = rows.data.valueRanges;


        let countries = [
            {
                name: 'England',
                leagues: [
                    {
                        level: 1,
                        isPrimary: true,
                        cities: [],
                        names: [],
                        nicknames: null,
                        firstColors: [],
                        secondColors: [],
                        regions: [],
                        icons: []
                    },
                    {
                        level: 2,
                        isPrimary: true,
                        cities: [],
                        names: [],
                        nicknames: null,
                        firstColors: [],
                        secondColors: [],
                        regions: [],
                        icons: []
                    },
                    {
                        level: 3,
                        isPrimary: false,
                        cities: [],
                        names: [],
                        nicknames: [],
                        colors: [],
                        regions: [],
                    }
                ]
            },
            {
                name: 'Spain',
                leagues: [
                    {
                        level: 1,
                        isPrimary: true,
                        cities: [],
                        names: [],
                        firstColors: [],
                        secondColors: [],
                        regions: [],
                        icons: []
                    },
                    {
                        level: 2,
                        isPrimary: true,
                        cities: [],
                        names: [],
                        firstColors: [],
                        secondColors: [],
                        regions: [],
                        icons: []
                    },
                    {
                        level: 3,
                        isPrimary: false,
                        cities: [],
                        names: [],
                        nicknames: [],
                        colors: [],
                        regions: [],
                    }
                ]
            },
        ];


        for (let rngIdx = 0; rngIdx < valueRanges.length; rngIdx++) {
            let currRange = valueRanges[rngIdx],
                country = currRange.values[0][0],
                leagueLevel = +currRange.values[0][1].split(' ')[1],
                currLeague;

            for (let countryIdx = 0; countryIdx < countries.length; countryIdx++) {
                if (countries[countryIdx].name === country) {
                    for (let leagueIdx = 0; leagueIdx < countries[countryIdx].leagues.length; leagueIdx++) {
                        if (countries[countryIdx].leagues[leagueIdx].level === leagueLevel) {
                            currLeague = countries[countryIdx].leagues[leagueIdx];
                            break;
                        }
                    }
                    break;
                }
            } //поиск нужной лиги

            for (let rowIdx = 2; rowIdx < currRange.values.length; rowIdx++) {
                if (currLeague.isPrimary) {
                    currLeague.cities.push(currRange.values[rowIdx][0]);
                    currLeague.names.push(currRange.values[rowIdx][1]);
                    currLeague.firstColors.push(currRange.values[rowIdx][2]);
                    currLeague.secondColors.push(currRange.values[rowIdx][3]);
                    currLeague.regions.push(currRange.values[rowIdx][4]);
                    currLeague.icons.push(currRange.values[rowIdx][5]);
                }
                else {
                    if (currRange.values[rowIdx][0]) currLeague.cities.push(currRange.values[rowIdx][0]);
                    if (currRange.values[rowIdx][1]) currLeague.names.push(currRange.values[rowIdx][1]);
                    if (currRange.values[rowIdx][2]) currLeague.nicknames.push(currRange.values[rowIdx][2]);
                    if (currRange.values[rowIdx][3]) currLeague.colors.push(currRange.values[rowIdx][3]);
                    if (currRange.values[rowIdx][4]) currLeague.regions.push(currRange.values[rowIdx][4]);
                }
            }
        }

        console.dir(countries, {depth: null});

        await fileHandle.writeFile(path.resolve(__dirname, '../data/bots-names-patterns.txt'), JSON.stringify(countries));

        res.json({
            message: 'Имена успешно пропаршены!'
        });
    }
    catch (e) {
        next(e);
    }
});
//google sheets (parsers) ===============================================================================


//players cards ===============================================================================
AdminApiRouter.post('/cards/generate', async (req, res, next) => {
    try {
        const data = {
            log: '',
            league1: [],
            league2: [],
            league3: [],
            league4: [],
            league5: [],
            league6: [],
            league7: [],
            league8: [],
        };

        //league 1============================
        data.league1 = generateStartCardsSet(1, 1);

        data.log += `League #1 =========`;
        for (let i = 0; i < data.league1.length; i++) {
            let player = data.league1[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #1 =========`;
        //league 1============================

        //league 2============================
        data.league2 = generateStartCardsSet(1, 2);

        data.log += `\n\nLeague #2 =========`;
        for (let i = 0; i < data.league2.length; i++) {
            let player = data.league2[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #2 =========`;
        //league 2============================

        //league 3============================
        data.league3 = generateStartCardsSet(1, 3);

        data.log += `\n\nLeague #3 =========`;
        for (let i = 0; i < data.league3.length; i++) {
            let player = data.league3[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #3 =========`;
        //league 3============================

        //league 4============================
        data.league4 = generateStartCardsSet(1, 4);

        data.log += `\n\nLeague #4 =========`;
        for (let i = 0; i < data.league4.length; i++) {
            let player = data.league4[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #4 =========`;
        //league 4============================

        //league 5============================
        data.league5 = generateStartCardsSet(1, 5);

        data.log += `\n\nLeague #5 =========`;
        for (let i = 0; i < data.league5.length; i++) {
            let player = data.league5[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #5 =========`;
        //league 5============================

        //league 6============================
        data.league6 = generateStartCardsSet(1, 6);

        data.log += `\n\nLeague #6 =========`;
        for (let i = 0; i < data.league6.length; i++) {
            let player = data.league6[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #6 =========`;
        //league 6============================

        //league 7============================
        data.league7 = generateStartCardsSet(1, 7);

        data.log += `\n\nLeague #7 =========`;
        for (let i = 0; i < data.league7.length; i++) {
            let player = data.league7[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #7 =========`;
        //league 7============================

        //league 8============================
        data.league8 = generateStartCardsSet(1, 8);

        data.log += `\n\nLeague #8 =========`;
        for (let i = 0; i < data.league8.length; i++) {
            let player = data.league8[i],
                phy = 0, te = 0, asm;

            for (let skill in player.physicalSkills) {
                phy += player.physicalSkills[skill];
            }
            for (let skill in player.technicalSkills) {
                te += player.technicalSkills[skill];
            }

            phy = Math.min(Math.max(1, phy), 5);
            te = Math.min(Math.max(1, te), 5);

            asm = (phy + te) + player.mood;
            asm = Math.min(Math.max(1, asm), 10);

            if (asm % 1 !== 0) {
                asm += 0.5 * (player.mood < 0 ? -1 : 1);
            }

            data.log += `\n${player.playerName} (#${player.playerId}) - ${asm} stars`;
        }
        data.log += `\nLeague #8 =========`;
        //league 8============================


        res.json({
            message: 'Карты игроков успешно созданы!',
            details: {
                data
            }
        });
    }
    catch (e) {
        next(e);
    }
});
//players cards ===============================================================================

module.exports = AdminApiRouter;