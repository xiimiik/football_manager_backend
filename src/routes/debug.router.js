const { Router } = require("express");
const {
  regenerateUserPlayersAndLastTeamMany,
  regenerateUserPlayersAndLastTeamWithRandomRatingsMany,
  regenerateUserLogoMany,
  playDebugMatch_v_17otr_v1,
  playPhaseMatches_debug,
  playWeekendLeagues_debug,
} = require("../utils/debug.utils");
const { prisma } = require("../../prisma-client");
const fileHandle = require("fs/promises");
const ApiError = require("../exceptions/api-error");
const { createLeaguesNMatches } = require("../modules/weekend_leagues");

const DebugApiRouter = Router();

// users ===============================================================================
DebugApiRouter.get("/regenerate_all_user_logos", async (req, res, next) => {
  try {
    await regenerateUserLogoMany();

    res.json({
      message: "Лого всех юзеров перегенерированы!",
    });
  } catch (e) {
    next(e);
  }
});

DebugApiRouter.get(
  "/regenerateAllPlayersAndLastTeams",
  async (req, res, next) => {
    try {
      await regenerateUserPlayersAndLastTeamMany();

      res.json({
        message: "Все игроки и команды юзеров перегенерированы!",
      });
    } catch (e) {
      next(e);
    }
  }
);

DebugApiRouter.get(
  "/regenerateAllUserPlayersAndLastTeamWithRandomRatings",
  async (req, res, next) => {
    try {
      console.log(
        "(routes/debug.router.js) Started regenerating all players with random ratings!"
      );
      await regenerateUserPlayersAndLastTeamWithRandomRatingsMany();

      res.json({
        message:
          "Все игроки и команды юзеров перегенерированы с рандомными рейтингами!",
      });
      console.log(
        "(routes/debug.router.js) All players with random ratings was regenerated succesfully!"
      );
    } catch (e) {
      next(e);
    }
  }
);
// users ===============================================================================

// matches ===============================================================================
DebugApiRouter.get(
  "/regenerate_matches_for_all_leagues",
  async (req, res, next) => {
    async function createLeagues() {
      let dataBuffer = await fileHandle.readFile("./src/data/variables.txt"),
        data = JSON.parse(dataBuffer.toString("utf8")),
        lastLeagueUpdateTimestamp = new Date(data.lastLeagueUpdateTimestamp),
        [, , allLeagues] = await prisma.$transaction([
          prisma.match.deleteMany({}),
          prisma.user.findMany({
            select: {
              id: true,
            },
          }),
          prisma.league.findMany({
            select: {
              id: true,
              leaguePlayers: {
                select: {
                  playerId: true,
                },
              },
            },
          }),
        ]),
        processedMatchesObjects = [];

      lastLeagueUpdateTimestamp.setUTCDate(
        lastLeagueUpdateTimestamp.getUTCDate() - 14
      );

      for (let leagueIdx = 0; leagueIdx < allLeagues.length; leagueIdx++) {
        let currLeague = allLeagues[leagueIdx];

        //! рефактор =======================
        function showRoundedArr(arr) {
          let fStr = arr[0].join(" "),
            sStr = arr[1].join(" "),
            res = fStr + "\n" + sStr;

          console.log("==============\n" + res + "\n==============");
        }

        function roundedArrStep(arr) {
          let num0 = arr[0][0],
            num1 = arr[0][1],
            num2 = arr[0][2],
            num3 = arr[0][3],
            num4 = arr[0][4],
            num5 = arr[0][5],
            num6 = arr[0][6],
            num7 = arr[1][7],
            num8 = arr[1][6],
            num9 = arr[1][5],
            num10 = arr[1][4],
            num11 = arr[1][3],
            num12 = arr[1][2],
            num13 = arr[1][1],
            num14 = arr[1][0];

          arr[0][0] = num14;
          arr[0][1] = num0;
          arr[0][2] = num1;
          arr[0][3] = num2;
          arr[0][4] = num3;
          arr[0][5] = num4;
          arr[0][6] = num5;
          arr[1][7] = num6;
          arr[1][6] = num7;
          arr[1][5] = num8;
          arr[1][4] = num9;
          arr[1][3] = num10;
          arr[1][2] = num11;
          arr[1][1] = num12;
          arr[1][0] = num13;
        }

        //! рефактор =======================

        let firstTeams = [],
          secondTeams = [];
        for (let i = currLeague.leaguePlayers.length / 2 - 1; i >= 0; i--)
          firstTeams.push(currLeague.leaguePlayers[i].playerId);
        for (
          let i = currLeague.leaguePlayers.length / 2;
          i < currLeague.leaguePlayers.length;
          i++
        )
          secondTeams.push(currLeague.leaguePlayers[i].playerId);

        let allPlayersArr1 = [firstTeams, secondTeams],
          allPlayersArr2 = [[...secondTeams], [...firstTeams]], // копируем из-за "ссылочности массивов"
          utcHours = [0, 8, 16];

        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 3; j++) {
            let resultTimeWeek1 = new Date(lastLeagueUpdateTimestamp),
              resultTimeWeek2 = new Date(lastLeagueUpdateTimestamp);

            resultTimeWeek1.setUTCDate(
              lastLeagueUpdateTimestamp.getUTCDate() + 15 + i
            );
            resultTimeWeek1.setUTCHours(utcHours[j], 0, 0, 0);
            resultTimeWeek2.setUTCDate(
              lastLeagueUpdateTimestamp.getUTCDate() + 22 + i
            );
            resultTimeWeek2.setUTCHours(utcHours[j], 0, 0, 0);

            //можно оставить так или раскидать на два отдельных цикла
            for (let k = 0; k < 8; k++) {
              processedMatchesObjects.push({
                player1Id: allPlayersArr1[0][k],
                player2Id: allPlayersArr1[1][k],
                leagueId: currLeague.id,
                time: resultTimeWeek1,
              });
              processedMatchesObjects.push({
                player1Id: allPlayersArr2[0][k],
                player2Id: allPlayersArr2[1][k],
                leagueId: currLeague.id,
                time: resultTimeWeek2,
              });
            }

            roundedArrStep(allPlayersArr1);
            roundedArrStep(allPlayersArr2);
          }
        }
      }

      await prisma.match.createMany({
        data: processedMatchesObjects,
      });

      console.log(`Leagues created! (modules/leagues.js)`);
    }

    try {
      await createLeagues();

      res.json({
        message: "Все матчи перегенерированы!",
      });
    } catch (e) {
      next(e);
    }
  }
);

DebugApiRouter.get("/playAllMatchesTillNow", async (req, res, next) => {
  try {
    let matches = await prisma.match.findMany({
      select: {
        id: true,
      },
      where: {
        time: {
          lte: new Date(),
        },
      },
    });

    console.log(
      `(routes/debug.router.js) Now is ${new Date().toUTCString()}, starting playing all matches till now!`
    );
    for (let i = 0; i < matches.length; i++) {
      await playDebugMatch_v_17otr_v1(matches[i].id, true);
    }
    console.log(
      `(routes/debug.router.js) Played all matches till now! Count: ${matches.length}.`
    );

    res.json({
      message: "Все матчи сыграны (с датой разыгровки до текущего дня)!",
    });
  } catch (e) {
    next(e);
  }
});
// matches ===============================================================================

// weekend leagues ===============================================================================
DebugApiRouter.get("/clear_weekend_tables", async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.weekend_match.deleteMany({}),
      prisma.weekend_league_players.deleteMany({}),
      prisma.weekend_league.deleteMany({}),
    ]);

    res.json({
      message: `Таблицы weekend очищены!`,
    });
  } catch (e) {
    next(e);
  }
});

DebugApiRouter.get("/create_leagues_and_matches", async (req, res, next) => {
  try {
    await createLeaguesNMatches();

    res.json({
      message: `Лиги на выходных (и матчи к ним) созданы!`,
    });
  } catch (e) {
    next(e);
  }
});

DebugApiRouter.post("/play_phase_weekend_matches", async (req, res, next) => {
  try {
    let phase = req.body.phase;

    if (!Number.isInteger(phase) || phase < 1 || phase > 10)
      throw ApiError.BadRequest("Such phase doesn't exists!");

    await playPhaseMatches_debug(phase);

    res.json({
      message: `Матчи ${phase} фазы сыграны!`,
    });
  } catch (e) {
    next(e);
  }
});

DebugApiRouter.get(
  "/create_and_play_weekend_leagues",
  async (req, res, next) => {
    try {
      await playWeekendLeagues_debug();

      res.json({
        message: `Лиги созданы и сыграны (найден победитель на каждом сервере)!`,
      });
    } catch (e) {
      next(e);
    }
  }
);

DebugApiRouter.get("/all_weekend_tournaments", async (req, res, next) => {
  try {
    let weekendLeagues = await prisma.weekend_league.findMany({
      select: {
        id: true,
        level: true,
        server_id: true,
        country_id: true,
        weekendLeaguePlayers: {
          select: {
            playerId: true,
          },
        },
        weekendLeagueMatches: {
          select: {
            id: true,
            user1_id: true,
            user2_id: true,
            score: true,
            time: true,
          },
        },
      },
    });

    res.json({
      message: `Все турниры на выходных:`,
      details: {
        weekendLeagues,
      },
    });
  } catch (e) {
    next(e);
  }
});
// weekend leagues ===============================================================================

DebugApiRouter.get("/test", (req, res) => {
  res.send("App is working!");
});

module.exports = DebugApiRouter;
