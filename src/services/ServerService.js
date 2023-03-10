const { prisma } = require("../../prisma-client");
const ApiError = require("../exceptions/api-error");
const fileHandle = require("fs/promises");
const path = require("path");
const { generateBot } = require("../utils/bots.utils");
const MathService = require("./MathService");

class ServerService {
  async generateServer(regionId) {
    try {
      let regionCountries = await prisma.country.findMany({
          select: {
            id: true,
            name: true,
          },
          where: {
            region_id: regionId,
          },
        }),
        countries = [];

      if (!regionCountries.length)
        throw ApiError.BadRequest(`Регион #${regionId} не существует!`);

      for (let cntrIdx = 0; cntrIdx < regionCountries.length; cntrIdx++) {
        let country = {
          name: regionCountries[cntrIdx].name,
          leagues: [],
        };

        for (let i = 0; i < 8; i++) {
          country.leagues.push({
            level: i + 1,
            bots: [],
          });
        }

        countries.push(country);
      }

      //генерация ботов и их форматирование (2) ==========================================
      let fileData = await fileHandle.readFile(
          path.resolve(__dirname, "../data/bots-names-patterns.txt")
        ),
        countryNamePatterns = JSON.parse(fileData);

      let botFullname = {},
        botLogo;

      // генерация данных ботов
      for (let i = 0; i < countries.length; i++) {
        let currCountry = countries[i],
          patternsCountry = null;

        for (let j = 0; j < countryNamePatterns.length; j++) {
          if (countryNamePatterns[j].name === currCountry.name) {
            patternsCountry = countryNamePatterns[j];
            break;
          }
        } //поиск страны с паттернами для имен команд

        for (let j = 0; j < currCountry.leagues.length; j++) {
          let currLeague = currCountry.leagues[j],
            generatedBots = [];

          if (patternsCountry) {
            for (let k = 0; k < patternsCountry.leagues.length; k++) {
              let patternLeague = patternsCountry.leagues[k];

              if (
                currLeague.level === patternLeague.level ||
                patternLeague ===
                  patternsCountry.leagues[patternsCountry.leagues.length - 1]
              ) {
                if (patternLeague.isPrimary) {
                  for (let botI = 0; botI < 16; botI++) {
                    botFullname.name =
                      patternLeague.cities[botI] +
                      " " +
                      patternLeague.names[botI];
                    botFullname.abbr = botFullname.name
                      .substring(0, 4)
                      .toUpperCase();

                    // setting logo =================================
                    let iconName = patternLeague.icons[botI],
                      iconColor = patternLeague.firstColors[botI],
                      shapeColor = patternLeague.secondColors[botI];

                    switch (iconColor) {
                      case "Black":
                        iconColor = "#090E19FF";
                        break;

                      case "Blue":
                        iconColor = "#135AE0FF";
                        break;

                      case "Claret":
                        iconColor = "#A01843FF";
                        break;

                      case "Ocean":
                        iconColor = "#A5FF5BFF";
                        break;

                      case "Red":
                        iconColor = "#EC242DFF";
                        break;

                      case "Sky":
                        iconColor = "#90CAFFFF";
                        break;

                      case "White":
                        iconColor = "#FAFCFFFF";
                        break;

                      case "Yellow":
                        iconColor = "#FFDA25FF";
                        break;
                    }

                    switch (shapeColor) {
                      case "Black":
                        shapeColor = "#090E19FF";
                        break;

                      case "Blue":
                        shapeColor = "#135AE0FF";
                        break;

                      case "Claret":
                        shapeColor = "#A01843FF";
                        break;

                      case "Ocean":
                        shapeColor = "#A5FF5BFF";
                        break;

                      case "Red":
                        shapeColor = "#EC242DFF";
                        break;

                      case "Sky":
                        shapeColor = "#90CAFFFF";
                        break;

                      case "White":
                        shapeColor = "#FAFCFFFF";
                        break;

                      case "Yellow":
                        shapeColor = "#FFDA25FF";
                        break;
                    }

                    botLogo = `{iconName:"${iconName}",iconColor:"${iconColor}",shapeColor:"${shapeColor}"}`;
                    // setting logo =================================

                    generatedBots.push(
                      generateBot(botFullname, botLogo, currLeague.level)
                    );
                  }
                } else {
                  for (let botI = 0; botI < 16; botI++) {
                    let city =
                        patternLeague.cities[
                          MathService.randomInteger(
                            0,
                            patternLeague.cities.length - 1
                          )
                        ],
                      nickname =
                        patternLeague.nicknames[
                          MathService.randomInteger(
                            0,
                            patternLeague.nicknames.length - 1
                          )
                        ],
                      name =
                        patternLeague.names[
                          MathService.randomInteger(
                            0,
                            patternLeague.names.length - 1
                          )
                        ];

                    botFullname.name = city + " " + nickname + " " + name;
                    botFullname.abbr =
                      city.substring(0, 1).toUpperCase() +
                      nickname.substring(0, 1).toUpperCase() +
                      name.substring(0, 1).toUpperCase();
                    botLogo = null;

                    generatedBots.push(
                      generateBot(botFullname, botLogo, currLeague.level)
                    );
                  }
                }
                break;
              }
            }
          } else {
            for (let botIdx = 0; botIdx < 16; botIdx++)
              generatedBots.push(generateBot(null, null, currLeague.level));
          }

          currLeague.bots = generatedBots;
        }
      }

      // обработка данных для query
      for (let i = 0; i < countries.length; i++) {
        let currCountry = countries[i];

        for (let j = 0; j < currCountry.leagues.length; j++) {
          let currLeague = currCountry.leagues[j];

          for (let k = 0; k < currLeague.bots.length; k++) {
            currLeague.bots[k] = {
              player: {
                create: {
                  name: currLeague.bots[k].name,
                  abbr: currLeague.bots[k].abbr,
                  logo: currLeague.bots[k].logo,
                  avatar: currLeague.bots[k].avatar,
                  isBot: currLeague.bots[k].isBot,
                  lastTactic: currLeague.bots[k].lastTactic,
                  lastTeam: currLeague.bots[k].lastTeam,
                  players: {
                    create: {
                      playersJson: currLeague.bots[k].playersJson,
                    },
                  },
                },
              },
            };
          }
        }
      }
      //генерация ботов и их форматирование (2) ==========================================

      // console.dir(JSON.parse(countries[0].leagues[0].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[1].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[2].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[3].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[4].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[5].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[6].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});
      // console.dir(JSON.parse(countries[0].leagues[7].bots[0].player.create.players.create.playersJson)[0].playerReputation, {depth: null});

      let processedLeaguesData = [];

      for (
        let countryIdx = 0;
        countryIdx < regionCountries.length;
        countryIdx++
      ) {
        for (let leagueLevel = 1; leagueLevel < 9; leagueLevel++) {
          processedLeaguesData.push({
            isFull: false,
            level: leagueLevel,
            country_id: regionCountries[countryIdx].id,
            leaguePlayers: {
              create: countries[countryIdx].leagues[leagueLevel - 1].bots,
            },
          });
        }
      }
      let server = await prisma.game_server.create({
        data: {
          region_id: regionId,
          leagues: {
            create: processedLeaguesData,
          },
        },
        select: {
          id: true,
          region: true,
          leagues: {
            select: {
              leaguePlayers: {
                select: {
                  player: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const dataBuffer = await fileHandle.readFile("./src/data/variables.txt");
      const data = JSON.parse(dataBuffer.toString("utf8"));
      const lastLeagueUpdateTimestamp = new Date(
        data.lastLeagueUpdateTimestamp
      );

      const allLeagues = await prisma.league.findMany({
        select: {
          id: true,
          leaguePlayers: {
            select: {
              playerId: true,
            },
          },
        },
        where: {
          server_id: server.id,
        },
      });
      const processedMatchesObjects = [];

      lastLeagueUpdateTimestamp.setUTCDate(
        lastLeagueUpdateTimestamp.getUTCDate() - 14
      );

      for (const currLeague of allLeagues) {
        const { leaguePlayers } = currLeague;

        function roundedArrStep(arr) {
          const [a0, a1, a2, a3, a4, a5, a6, a7] = arr[0];
          const [b0, b1, b2, b3, b4, b5, b6, b7] = arr[1];

          arr[0] = [b7, a0, a1, a2, a3, a4, a5, a6];
          arr[1] = [b6, b5, b4, b3, b2, b1, b0, a7];
        }

        const halfLength = leaguePlayers.length / 2;
        const firstTeams = leaguePlayers
          .slice(0, halfLength)
          .map((p) => p.playerId);
        const secondTeams = leaguePlayers
          .slice(halfLength)
          .map((p) => p.playerId);

        const allPlayersArr1 = [firstTeams, secondTeams],
          allPlayersArr2 = [[...secondTeams], [...firstTeams]],
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

      return server;
    } catch {
      return null;
    }
  }

  async getAllServers() {
    return await prisma.game_server.findMany({
      select: {
        id: true,
        region: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getServerCountries(id) {
    return await prisma.game_server.findFirst({
      where: {
        id,
      },
      select: {
        region: {
          select: {
            countries: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getLeaguesInServerCountry(serverId, countryId) {
    return await prisma.league.findMany({
      where: {
        server_id: serverId,
        country_id: countryId,
      },
      select: {
        id: true,
        isFull: true,
        level: true,
      },
    });
  }

  async getLeagueUsers(leagueId) {
    return await prisma.league_players.findMany({
      where: {
        leagueId,
      },
      select: {
        player: {
          select: {
            id: true,
            name: true,
            logo: true,
            isBot: true,
          },
        },
      },
    });
  }
}

module.exports = new ServerService();
