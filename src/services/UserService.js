const { prisma } = require("../../prisma-client");

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

  async updateUserWaitingPlayers(id, waitingPlayersJson) {
    try {
      await prisma.user_players.upsert({
        create: {
          userId: id,
          waitingPlayersJson,
        },
        update: {
          waitingPlayersJson,
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
    try {
      await prisma.user_players.upsert({
        create: {
          userId: id,
          tempDialogs,
        },
        update: {
          tempDialogs,
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
    return await prisma.user_players.findFirst({
      select: {
        tempDialogs: true,
      },
      where: {
        userId: id,
      },
    });
  }

  async getUserLastPlayedMatch(id) {
    return await prisma.match.findFirst({
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
  }
}

module.exports = new UserService();
