const { prisma } = require("../../prisma-client");
const ApiError = require("../exceptions/api-error");
const { trainingTime, trainingAvailableTime } = require("../utils/dates.utils");

class UserService {
  async getUserInfo(id) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        abbr: true,
        logo: true,
        dollars: true,
        cCoins: true,
        sCoins: true,
        tCoins: true,
        avatar: true,
      },
    });
  }

  async getUserProgress(id) {
    return await prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        players: {
          select: {
            playersJson: true,
            waitingPlayersJson: true,
          },
        },
      },
    });
  }

  async getUserPlayer(userId, playerId) {
    const user_players = await prisma.user_players.findUnique({
      where: {
        userId,
      },
      select: {
        playersJson: true,
      },
    });

    const playersJson = JSON.parse(user_players.playersJson);
    const player = playersJson.find((player) => player.playerId === playerId);

    if (!playersJson || !player) {
      return null;
    }

    return player;
  }

  async getUserCurrentLeagueMatches(id) {
    const MatchResult = Object.freeze({
      NotOverYet: "Not Over Yet",
      Won: "Won",
      Lost: "Lost",
      Draw: "Draw",
    });

    const leagueMatches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: id }, { player2Id: id }],
      },
    });

    const matchData = await Promise.all(
      leagueMatches.map(async (match) => {
        let result = MatchResult.NotOverYet;
        const enemyId =
          match.player1Id === id ? match.player2Id : match.player1Id;
        const enemy = await prisma.user.findUnique({
          where: {
            id: enemyId,
          },
          select: {
            logo: true,
          },
        });

        if (match.score) {
          const score = match.score.split(":");

          if (score[0] === score[1]) {
            result = MatchResult.Draw;
          } else if (score[0] > score[1] && enemyId === match.player1Id) {
            result = MatchResult.Lost;
          } else if (score[0] > score[1] && enemyId === match.player2Id) {
            result = MatchResult.Won;
          }
        }

        return {
          enemyLogo: enemy.logo,
          result,
          matchScore: match.score,
        };
      })
    );

    return matchData;
  }

  async updateUserProfile(id, name, abbr, logo) {
    try {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
          abbr,
          logo,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getUserMoney(id) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        dollars: true,
        cCoins: true,
        sCoins: true,
        tCoins: true,
      },
    });
  }

  async updateUserMoney(id, moneyType, amount) {
    try {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          [moneyType]: amount,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateUserAvatar(id, avatar) {
    try {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          avatar,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateUserPlayers(id, playersJson) {
    try {
      await prisma.user_players.upsert({
        create: {
          userId: id,
          playersJson,
        },
        update: {
          playersJson,
        },
        where: {
          userId: id,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateUserPlayer(id, playerId, data) {
    try {
      const user_players = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          lastTeam: true,
        },
      });

      const playersJson = JSON.parse(user_players.lastTeam);
      const playerIndex = playersJson.findIndex(
        (player) => player.playerId === playerId
      );

      if (!playersJson || playerIndex < 0) {
        return false;
      }

      playersJson[playerIndex] = data;

      await prisma.user.update({
        where: {
          id,
        },
        data: {
          lastTeam: JSON.stringify(playersJson),
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  async updateUserWaitingPlayers(id, waitingPlayersJson) {
    try {
      await prisma.user_players.update({
        data: {
          waitingPlayersJson: JSON.stringify(waitingPlayersJson),
        },
        where: {
          userId: id,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async releasePlayer(id, playerId) {
    try {
      const [user_players, lastTeam] = await prisma.$transaction([
        prisma.user_players.findFirst({
          where: {
            userId: id,
          },
        }),
        prisma.user.findFirst({
          where: {
            id,
          },
          select: {
            lastTeam: true,
          },
        }),
      ]);

      const playersJson = JSON.parse(user_players.playersJson).filter(
        (player) => player.playerId !== playerId
      );

      await prisma.user_players.update({
        data: {
          playersJson: JSON.stringify(playersJson),
        },
        where: {
          userId: id,
        },
      });

      if (
        JSON.parse(lastTeam.lastTeam).some(
          (player) => player.playerId === playerId
        )
      ) {
        const lastTeamJson = JSON.parse(lastTeam.lastTeam).filter(
          (player) => player.playerId !== playerId
        );

        await prisma.user.update({
          data: {
            lastTeam: JSON.stringify(lastTeamJson),
          },
          where: {
            id,
          },
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async hirePlayer(id, waitingId) {
    try {
      const user_players = await prisma.user_players.findFirst({
        where: {
          userId: id,
        },
      });

      const playersJson = JSON.parse(user_players.playersJson);
      const waitingPlayersJson = JSON.parse(user_players.waitingPlayersJson);

      const largestPlayerId = playersJson.reduce((acc, cur) => {
        return cur.playerId > acc ? cur.playerId : acc;
      }, 0);

      const waitingPlayer = waitingPlayersJson.find(
        (player) => player.playerId === waitingId
      );

      if (largestPlayerId <= 0 || !waitingPlayer) {
        return false;
      }

      const filteredWaiting = waitingPlayersJson.filter(
        (player) => player.playerId !== waitingPlayer.playerId
      );

      waitingPlayer.playerId = largestPlayerId + 1;
      playersJson.push(waitingPlayer);

      await prisma.user_players.update({
        data: {
          playersJson: JSON.stringify(playersJson),
          waitingPlayersJson: JSON.stringify(filteredWaiting),
        },
        where: {
          userId: id,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateUserTempPlayer(id, tempPlayer) {
    try {
      await prisma.user_players.upsert({
        where: {
          userId: id,
        },
        create: {
          userId: id,
          tempPlayer,
        },
        update: {
          tempPlayer,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkUserTempPlayer(id) {
    return await prisma.user_players.findFirst({
      select: {
        tempPlayer: true,
      },
      where: {
        userId: id,
      },
    });
  }

  async updateUserTempAction(id, tempAction) {
    try {
      await prisma.user_players.upsert({
        create: {
          userId: id,
          tempAction,
        },
        update: {
          tempAction,
        },
        where: {
          userId: id,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkUserTempAction(id) {
    return await prisma.user_players.findFirst({
      select: {
        tempAction: true,
      },
      where: {
        userId: id,
      },
    });
  }

  async updateUserTempDialogs(id, tempDialogs) {
    const tempJson = {
      tempDialogs: tempDialogs,
    };

    try {
      await prisma.user_players.upsert({
        create: {
          userId: id,
          tempDialogs: JSON.stringify(tempJson),
        },
        update: {
          tempDialogs: JSON.stringify(tempJson),
        },
        where: {
          userId: id,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkUserTempDialogs(id) {
    const userDialogs = await prisma.user_players.findFirst({
      select: {
        tempDialogs: true,
      },
      where: {
        userId: id,
      },
    });

    return JSON.parse(userDialogs.tempDialogs);
  }

  async getUserLastPlayedMatch(id) {
    const match = await prisma.match.findFirst({
      select: {
        logs: true,
        time: true,
        leagueId: true,
        player1: {
          select: {
            logo: true,
            name: true,
            avatarTb: true,
            players: {
              select: {
                playersJson: true,
              },
            },
          },
        },
        player2: {
          select: {
            logo: true,
            name: true,
            avatarTb: true,
            players: {
              select: {
                playersJson: true,
              },
            },
          },
        },
      },
      where: {
        OR: [{ player1Id: id }, { player2Id: id }],
        AND: {
          NOT: {
            score: null,
          },
        },
      },
      orderBy: {
        time: "desc",
      },
      take: 1,
    });

    if (!match) {
      return null;
    }

    const matchInfo = {
      team1: {
        logo: match.player1.logo,
        name: match.player1.name,
        avatar: match.player1.avatarTb.id,
        teamComposition: match.player1.players.playersJson,
      },
      team2: {
        logo: match.player2.logo,
        name: match.player2.name,
        avatar: match.player2.avatarTb.id,
        teamComposition: match.player2.players.playersJson,
      },
      leagueId: match.leagueId,
      matchLogs: match.logs,
    };

    return matchInfo;
  }

  async getClubTalk(id) {
    return await prisma.user_players.findFirst({
      select: {
        clubTalk: true,
      },
      where: {
        userId: id,
      },
    });
  }

  async setClubTalk(id, place) {
    try {
      await prisma.user_players.update({
        where: {
          userId: id,
        },
        data: {
          clubTalk: place,
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  async checkTraining(id) {
    const userTraining = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        isBot: true,
        training: true,
      },
    });

    if (!userTraining) {
      return null;
    }

    const trainingJson = JSON.parse(userTraining.training);

    const now = new Date();
    const [scT, th3, frT] = trainingTime();

    const night = trainingAvailableTime(9);
    const morning = trainingAvailableTime(13);
    const day = trainingAvailableTime(17);

    if ((night <= now) && (now < scT) && trainingJson.training.isAvailable) {
      return true;
    } else if ((morning <= now) && (now < th3) && trainingJson.training.isAvailable) {
      return true;
    } else if ((day <= now) && (now < frT) && trainingJson.training.isAvailable) {
      return true;
    } else {
      return false;
    }
  }

  async checkTrainingResults(id) {
    try {
      const userTraining = await prisma.user.findFirst({
        where: {
          id,
        },
        select: {
          isBot: true,
          training: true,
        },
      });

      if (!userTraining) {
        return null;
      }

      if (userTraining.isBot) {
        return null;
      }

      const trainingJson = JSON.parse(userTraining.training);

      const training = trainingJson.training;

      await prisma.user.update({
        where: {
          id,
        },
        data: {
          training: JSON.stringify([{
            isAvailable: false,
            training: [],
          }]),
        },
      });

      return training;
    } catch {
      return null;
    }
  }

  async doTraining(id, points) {
    try {
      const userTraining = await prisma.user.findFirst({
        where: {
          id,
          isBot: false,
        },
        select: {
          training: true,
        },
      });

      if (!userTraining) {
        return false;
      }

      const trainingJson = JSON.parse(userTraining.training);

      trainingJson.training[trainingJson.length - 1].points += points;
      trainingJson.training[trainingJson.length - 1].nonPassed -= 1;
      trainingJson.isAvailable = false;

      await prisma.user.update({
        where: {
          id,
        },
        data: {
          training: JSON.stringify(trainingJson),
        },
      });

      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new UserService();
