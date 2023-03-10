const fileHandle = require("fs/promises");
const { prisma } = require("../../prisma-client.js");
const { timeUntilNextScheduledDate } = require("../utils/dates.utils.js");
const { playDebugMatch_17otr_v3_09I19 } = require("../utils/debug.utils");
const { generateCard } = require("./players");

async function scheduleLeaguesInterval() {
  async function createLeagues() {
    let dataBuffer = await fileHandle.readFile("./src/data/variables.txt"),
      data = JSON.parse(dataBuffer.toString("utf8")),
      lastLeagueUpdateTimestamp = new Date(data.lastLeagueUpdateTimestamp);

    // создание расписания матчей на две недели ====================================
    let [, , allLeagues] = await prisma.$transaction([
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

    for (let leagueIdx = 0; leagueIdx < allLeagues.length; leagueIdx++) {
      let currLeague = allLeagues[leagueIdx];

      function roundedArrStep(arr) {
        const [a0, a1, a2, a3, a4, a5, a6, a7] = arr[0];
        const [b0, b1, b2, b3, b4, b5, b6, b7] = arr[1];

        arr[0] = [b7, a0, a1, a2, a3, a4, a5, a6];
        arr[1] = [b6, b5, b4, b3, b2, b1, b0, a7];
      }

      // creation of common leagues ==========================================================================================
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
        utcHours = [9, 13, 17];

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
      // creation of common leagues ==========================================================================================
    }

    await prisma.match.createMany({
      data: processedMatchesObjects,
    });
    // создание расписания матчей на две недели ====================================

    // генерация игроков, если недостаточно (< 20) ====================================
    let userPlayers = await prisma.user_players.findMany({
      select: {
        playersJson: true,
        user: {
          select: {
            id: true,
            avatar: true,
            leaguePlayers: {
              select: {
                league: {
                  select: {
                    level: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (let idx = 0; idx < userPlayers.length; idx++) {
      userPlayers[idx].playersJson = JSON.parse(userPlayers[idx].playersJson);

      let largestPlayerId = 1;
      for (
        let plIdx = 0;
        plIdx < userPlayers[idx].playersJson.length;
        plIdx++
      ) {
        if (userPlayers[idx].playersJson[plIdx].playerId > largestPlayerId)
          largestPlayerId = userPlayers[idx].playersJson[plIdx].playerId;
      }

      while (userPlayers[idx].playersJson.length < 20) {
        let generatedCard = generateCard(
          largestPlayerId,
          false,
          userPlayers[idx].user.avatar,
          { currentAbility: -1, potential: -1 },
          userPlayers[idx].user.leaguePlayers[0].league.level
        );

        userPlayers[idx].playersJson.push(generatedCard);
        largestPlayerId++;
      }

      userPlayers[idx].playersJson = JSON.stringify(
        userPlayers[idx].playersJson
      );
    }

    await prisma.$transaction(
      userPlayers.map((user) =>
        prisma.user_players.update({
          data: {
            playersJson: user.playersJson,
          },
          where: {
            userId: user.user.id,
          },
        })
      )
    );
    // генерация игроков, если недостаточно (< 20) ====================================

    console.log(`Leagues created! (modules/leagues.js)`);
  }

  const dataBuffer = await fileHandle.readFile("./src/data/variables.txt");
  const data = JSON.parse(dataBuffer.toString("utf8"));
  const lastLeagueUpdateTimestamp = new Date(data.lastLeagueUpdateTimestamp);
  const now = new Date();
  const twoWeeksMs = 1000 * 60 * 60 * 24 * 14;

  //обновление лиг (установка двухнедельных интервалов)
  if (now.getTime() < lastLeagueUpdateTimestamp.getTime() + twoWeeksMs) {
    console.log(
      `(modules/leagues.js) All's fine, next leagues update at ${new Date(
        lastLeagueUpdateTimestamp.getTime() + twoWeeksMs
      ).toUTCString()}. Days to update: ${
        (twoWeeksMs - (now.getTime() - lastLeagueUpdateTimestamp.getTime())) /
        (1000 * 60 * 60 * 24)
      }`
    );

    setTimeout(async () => {
      await createLeagues();

      setInterval(async () => {
        await createLeagues();
      }, twoWeeksMs);
    }, twoWeeksMs - (now.getTime() - lastLeagueUpdateTimestamp.getTime()));
  } else {
    await createLeagues();

    setTimeout(async () => {
      await createLeagues();

      setInterval(async () => {
        await createLeagues();
      }, twoWeeksMs);
    }, twoWeeksMs - (now.getTime() - (lastLeagueUpdateTimestamp.getTime() + twoWeeksMs)));

    data.lastLeagueUpdateTimestamp = new Date(
      lastLeagueUpdateTimestamp.getTime() + twoWeeksMs
    );
    await fileHandle.writeFile(
      "./src/data/variables.txt",
      JSON.stringify(data)
    );

    console.log(
      `(modules/leagues.js) Its late, but leagues was updated (now lastLeagueUpdateTimestamp=${data.lastLeagueUpdateTimestamp})!`
    );
  }
}

async function scheduleMatchesInterval() {
  async function playMatches(mode) {
    console.log(`Started playing ${mode} matches! `, new Date());
    let where;
    switch (mode) {
      case "current":
        let datetime = new Date();
        datetime.setUTCHours(datetime.getUTCHours() + 1, 0, 0, 0);
        where = {
          time: datetime,
          score: null,
        };
        break;

      case "late":
        where = {
          time: {
            lte: new Date(),
          },
          score: null,
        };
        break;

      case "all_valid":
        where = {
          time: {
            lte: new Date(),
          },
        };
        break;

      default:
        console.log("Invalid mode argument!");
        return;
    }

    // делим на чанки, потому что вылазит ошибка от призмы из-за одного запроса на большое количество данных ================
    const chunkLength = 400;
    const matchesCount = await prisma.match.count({
      where,
    });

    if (matchesCount > chunkLength) {
      for (let i = 0; i < Math.floor(matchesCount / chunkLength) + 1; i++) {
        const skip = i * chunkLength;
        const take = Math.min(chunkLength, matchesCount - skip);
        const chunkOfMatches = await prisma.match.findMany({
          select: {
            id: true,
          },
          where,
          take,
        });

        const queries = [];
        for (const match of chunkOfMatches) {
          const newQueries = await playDebugMatch_17otr_v3_09I19(
            match.id,
            true
          );
          queries.push(...newQueries);
        }

        try {
          await prisma.$transaction(queries);
        } catch (e) {
          console.log(`Error executing transaction: ${e}`);
        }
      }
    } else {
      const matches = await prisma.match.findMany({
        select: {
          id: true,
        },
        where,
      });

      const queries = [];
      for (const match of matches) {
        const newQueries = await playDebugMatch_17otr_v3_09I19(match.id, true);
        queries.push(...newQueries);
      }

      try {
        await prisma.$transaction(queries);
      } catch (e) {
        console.log(`Error executing transaction: ${e}`);
      }
    }
    // делим на чанки, потому что вылазит ошибка от призмы из-за одного запроса на большое количество данных ================

    console.log(
      `Ended playing ${mode} matches (count: ${matchesCount})! `,
      new Date()
    );
  }

  async function setTrainingAvailable() {
    const notBotUsers = await prisma.user.findMany({
      where: {
        isBot: false,
      },
      select: {
        id: true,
        training: true,
      },
    });

    const queries = [];

    for (const { training, id } of notBotUsers) {
      const trainingJson = JSON.parse(training);

      trainingJson.isAvailable = true;

      queries.push(
        prisma.user.update({
          where: {
            id,
          },
          data: {
            training: JSON.stringify(trainingJson),
          },
        })
      );
    }

    await prisma.$transaction(queries);
  }

  async function clearTempPlayer() {
    await prisma.user_players.updateMany({
      data: {
        tempPlayer: null,
      },
    });
  }

  try {
    //розыгрыш матчей (установка 8-часовых интервалов)
    const hourInMs = 3600000;
    const msLeft = timeUntilNextScheduledDate() - 1000 * 60 * 15;

    setTimeout(async () => {
      setInterval(async () => {
        const now = new Date();
        const hour = now.getUTCHours();

        setTimeout(async () => {
          await setTrainingAvailable();
        }, 6000000);

        if (hour === 8 || hour === 12 || hour === 16) {
          await playMatches("current");
          await clearTempPlayer();
        }
      }, hourInMs);

      await playMatches("current");
      await clearTempPlayer();
    }, msLeft);

    await playMatches("late"); // разыгровка матчей (если некоторые были во время того, как сервак лежал)
  } catch (e) {
    console.log(
      "(modules/leagues.js) Error at async scheduleMatchesInterval...",
      e
    );
  }
}

async function leaguesModule() {
  try {
    await scheduleLeaguesInterval();
    await scheduleMatchesInterval();
  } catch (e) {
    console.log("Error:", e);
  }
}

module.exports = {
  leaguesModule,
};
