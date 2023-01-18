const {Router} = require('express');
const AuthController = require('../controllers/AuthController');
const {check} = require("express-validator");


const AuthApiRouter = Router();

// AuthApiRouter.post(
//     '/create',
//     check('teamName')
//         .isLength({min: 3, max: 12})
//         .withMessage('Имя должно входить в предел 3-12 символов'),
//     check('abbr')
//         .isLength({min: 2, max: 5})
//         .withMessage('Имя должно входить в предел 2-5 символов'),
//     check('logo')
//         .notEmpty()
//         .withMessage('Должно быть выбрано лого команды'),
//     async function (req, res, next) {
//         try {
//             // const errors = validationResult(req);
//             // if (!errors.isEmpty()) {
//             //     throw ApiError.BadRequest('Неверные данные при создании игрока!', {
//             //         type: 'validation-error',
//             //         fields: errors.array()
//             //     });
//             // }
//             //
//             // const
//             //     {teamName, abbr, logo} = req.body,
//             //     createdUser = await prisma.user.create({
//             //         data: {
//             //             name: teamName,
//             //             abbr,
//             //             logo,
//             //             avatar: 1,
//             //             isBot: false
//             //         }
//             //     });
//             //
//             // //если есть неполные лиги (с ботами) - кидаем на место любого бота реганного челика, в ином случае - создаем новую лигу с 15 ботами и новым челом
//             // const unfilledLeague = await prisma.league.findFirst({
//             //     where: {
//             //         isFull: false
//             //     }
//             // });
//             // if (unfilledLeague) {
//             //     const botsToSwap = await prisma.league_players.findMany({
//             //         where: {
//             //             leagueId: unfilledLeague.id,
//             //             player: {
//             //                 isBot: true
//             //             }
//             //         }
//             //     });
//             //
//             //     if (botsToSwap.length === 1) {
//             //         await prisma.$transaction([
//             //             prisma.league_players.update({
//             //                 data: {
//             //                     playerId: createdUser.id
//             //                 },
//             //                 where: {
//             //                     leagueId_playerId: {
//             //                         leagueId: unfilledLeague.id,
//             //                         playerId: botsToSwap[0].playerId,
//             //                     }
//             //                 }
//             //             }),
//             //             prisma.league.update({
//             //                 data: {
//             //                     isFull: true
//             //                 },
//             //                 where: {
//             //                     id: unfilledLeague.id,
//             //                 }
//             //             }),
//             //         ]);
//             //     }
//             //     else {
//             //         await prisma.league_players.update({
//             //             data: {
//             //                 playerId: createdUser.id
//             //             },
//             //             where: {
//             //                 leagueId_playerId: {
//             //                     leagueId: unfilledLeague.id,
//             //                     playerId: botsToSwap[0].playerId,
//             //                 }
//             //             }
//             //         });
//             //     }
//             // }
//             // else {
//             //     // ещё нужно создать результаты матчей ботов
//             //     let leaguePlayers = spawnBotsData(15, 0);
//             //
//             //     // console.log(leaguePlayers);
//             //
//             //     let formattedLeaguePlayers = {
//             //         create: []
//             //     };
//             //     leaguePlayers.forEach(leaguePlayer => {
//             //         formattedLeaguePlayers.create.push({
//             //             player: {
//             //                 create: {
//             //                     name: leaguePlayer.name,
//             //                     abbr: leaguePlayer.abbr,
//             //                     logo: leaguePlayer.logo,
//             //                     avatar: leaguePlayer.avatar,
//             //                     isBot: leaguePlayer.isBot,
//             //                     lastTactic: leaguePlayer.lastTactic,
//             //                     lastTeam: leaguePlayer.lastTeam,
//             //                     players: {
//             //                         create: {
//             //                             playersJson: leaguePlayer.playersJson,
//             //                         }
//             //                     },
//             //
//             //                 }
//             //             }
//             //         })
//             //     });
//             //
//             //     formattedLeaguePlayers.create.push({
//             //         player: {
//             //             connect: {
//             //                 id: createdUser.id
//             //             }
//             //         }
//             //     })
//             //
//             //     let createdLeague = await prisma.league.create({
//             //         data: {
//             //             isFull: false,
//             //             leaguePlayers: formattedLeaguePlayers
//             //         }
//             //     });
//             // }
//
//             res.json({
//                 message: 'Игрок успешно создан!',
//                 details: {
//                     user: {
//                         id: createdUser.id
//                     }
//                 }
//             });
//         }
//         catch (e) {
//             next(e);
//         }
//     }
// );
//
//
// AuthApiRouter.post(
//     '/create_v2',
//     check('teamName')
//         .isLength({min: 3, max: 12})
//         .withMessage('Имя должно входить в предел 3-12 символов'),
//     check('abbr')
//         .isLength({min: 2, max: 5})
//         .withMessage('Имя должно входить в предел 2-5 символов'),
//     check('logo')
//         .notEmpty()
//         .withMessage('Должно быть выбрано лого команды'),
//     async function (req, res, next) {
//         try {
//             // const errors = validationResult(req);
//             // if (!errors.isEmpty()) {
//             //     throw ApiError.BadRequest('Неверные данные при создании игрока!', {
//             //         type: 'validation-error',
//             //         fields: errors.array()
//             //     });
//             // }
//             //
//             // const
//             //     {teamName, abbr, logo} = req.body,
//             //     createdUser = await prisma.user.create({
//             //         data: {
//             //             name: teamName,
//             //             abbr,
//             //             logo,
//             //             avatar: 1,
//             //             isBot: false
//             //         }
//             //     });
//             //
//             // //если есть неполные лиги (с ботами) - кидаем на место любого бота реганного челика, в ином случае - создаем новую лигу с 15 ботами и новым челом
//             // const unfilledLeague = await prisma.league.findFirst({
//             //     where: {
//             //         isFull: false
//             //     }
//             // });
//             // if (unfilledLeague) {
//             //     const botsToSwap = await prisma.league_players.findMany({
//             //         where: {
//             //             leagueId: unfilledLeague.id,
//             //             player: {
//             //                 isBot: true
//             //             }
//             //         }
//             //     });
//             //
//             //     if (botsToSwap.length === 1) {
//             //         await prisma.$transaction([
//             //             prisma.league_players.update({
//             //                 data: {
//             //                     playerId: createdUser.id
//             //                 },
//             //                 where: {
//             //                     leagueId_playerId: {
//             //                         leagueId: unfilledLeague.id,
//             //                         playerId: botsToSwap[0].playerId,
//             //                     }
//             //                 }
//             //             }),
//             //             prisma.league.update({
//             //                 data: {
//             //                     isFull: true
//             //                 },
//             //                 where: {
//             //                     id: unfilledLeague.id,
//             //                 }
//             //             }),
//             //         ]);
//             //     }
//             //     else {
//             //         await prisma.league_players.update({
//             //             data: {
//             //                 playerId: createdUser.id
//             //             },
//             //             where: {
//             //                 leagueId_playerId: {
//             //                     leagueId: unfilledLeague.id,
//             //                     playerId: botsToSwap[0].playerId,
//             //                 }
//             //             }
//             //         });
//             //     }
//             // }
//             // else {
//             //     // ещё нужно создать результаты матчей ботов
//             //     let leaguePlayers = spawnBotsData(15, 0);
//             //
//             //     // console.log(leaguePlayers);
//             //
//             //     let formattedLeaguePlayers = {
//             //         create: []
//             //     };
//             //     leaguePlayers.forEach(leaguePlayer => {
//             //         formattedLeaguePlayers.create.push({
//             //             player: {
//             //                 create: {
//             //                     name: leaguePlayer.name,
//             //                     abbr: leaguePlayer.abbr,
//             //                     logo: leaguePlayer.logo,
//             //                     avatar: leaguePlayer.avatar,
//             //                     isBot: leaguePlayer.isBot,
//             //                     lastTactic: leaguePlayer.lastTactic,
//             //                     lastTeam: leaguePlayer.lastTeam,
//             //                     players: {
//             //                         create: {
//             //                             playersJson: leaguePlayer.playersJson,
//             //                         }
//             //                     },
//             //
//             //                 }
//             //             }
//             //         })
//             //     });
//             //
//             //     formattedLeaguePlayers.create.push({
//             //         player: {
//             //             connect: {
//             //                 id: createdUser.id
//             //             }
//             //         }
//             //     })
//             //
//             //     let createdLeague = await prisma.league.create({
//             //         data: {
//             //             isFull: false,
//             //             leaguePlayers: formattedLeaguePlayers
//             //         }
//             //     });
//             // }
//
//             res.json({
//                 message: 'Игрок успешно создан!',
//                 details: {
//                     user: {
//                         id: createdUser.id
//                     }
//                 }
//             });
//         }
//         catch (e) {
//             next(e);
//         }
//     }
// );

AuthApiRouter.post('/user_swap_bot', [
    check('botId').isInt().withMessage('Поле <botId> должно быть типа integer!').toInt(),
], AuthController.swapUserWithBot);


//= Есть три игровых профиля: player1 (id = 1), player2 (id = 2), player3 (id = 3)
//= Профиль (id = 1) подключили к аккаунту гугла tmp1@gmail.com, (id = 2) - к tmp2@gmail.com, (id = 3) - к tmp3@gmail.com
//= Если выйти из аккаунта tmp1@gmail.com и подсоединить профиль по новой к нему же - ничего не произойдет, ибо (id = 1) <=> tmp1@gmail.com
//= Если выйти из аккаунта tmp1@gmail.com и подсоединить профиль к tmp2@gmail.com, то у юзера появится выбор (попап):
//=     1. Загрузить на устройство (id = 2), тогда на устройстве будет профиль (id = 2), а в бд ничего не перезапишется
//=     2. Записать (id = 1) в tmp2@gmail.com, тогда tmp2@gmail.com будет ссылаться на (id = 1), а tmp1@gmail.com будет пустой и (id = 2) не привязан ни к чему (тогда этот прогресс достать невозможно)
//=     3. Ничего не делать и закрыть попап, тогда в бд ничего не перезапишется
//= Если выйти из аккаунта tmp2@gmail.com и подсоединить профиль к tmp1@gmail.com, то у юзера появится выбор (попап):
//=     1. Загрузить на устройство абсолютно новый профиль (поскольку tmp1@gmail.com ни на что не указывает), тогда в бд ничего не перезапишется
//=     2. Записать (id = 1) в tmp1@gmail.com, тогда tmp1@gmail.com будет ссылаться на (id = 1), а tmp2@gmail.com будет пустой
//=     3. Ничего не делать и закрыть попап, тогда в бд ничего не перезапишется
AuthApiRouter.get('/profileIdBy/:strategy/:accountId', [
    check('strategy').isString().withMessage('Поле <strategy> должно быть типа string!'),
    check('accountId').isString().withMessage('Поле <accountId> должно быть типа string!'),
], AuthController.getUserProfileByAccountId);

AuthApiRouter.post('/linkup', [
    check('user.id').isInt().withMessage('Поле <user.id> должно быть типа integer!').toInt(),
    check('linkup').custom(linkup => {
        if (typeof linkup.strategy !== "string") throw new Error('Поле <linkup.strategy> должно быть типа string!');
        if (typeof linkup.accountId !== "string") throw new Error('Поле <linkup.accountId> должно быть типа string!');
        return true;
    }),
], AuthController.linkupUserProfile);

AuthApiRouter.post('/reloadProfile', [
    check('user.id').isInt().withMessage('Поле <user.id> должно быть типа integer!').toInt(),
    check('linkup').custom(linkup => {
        if (typeof linkup.strategy !== "string") throw new Error('Поле <linkup.strategy> должно быть типа string!');
        if (typeof linkup.accountId !== "string") throw new Error('Поле <linkup.accountId> должно быть типа string!');
        return true;
    }),
], AuthController.reloadUserProfile);


module.exports = AuthApiRouter;