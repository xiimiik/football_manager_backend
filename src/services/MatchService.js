const { prisma } = require("../../prisma-client");

class MathService {
  async setMatchTeam(userId, teamJson) {
    try {
      await prisma.user.update({
        data: {
          lastTeam: teamJson,
        },
        where: {
          id: userId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async setMatchTactic(userId, tacticJson) {
    try {
      await prisma.user.update({
        data: {
          lastTactic: tacticJson,
        },
        where: {
          id: userId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getMatchInfo(id) {
    return await prisma.match.findFirst({
      select: {
        id: true,
        player1Id: true,
        player2Id: true,
        winnerId: true,
        logs: true,
        time: true,
        score: true,
      },
      where: {
        id,
      },
    });
  }

  async getLeagueLeaderboard(leagueId) {
    const leagueMatches = await prisma.match.findMany({
      select: {
        player1Id: true,
        player2Id: true,
        score: true,
      },
      where: {
        leagueId,
        score: {
          not: null,
        },
      },
    });
    if (!leagueMatches.length) return null;

    let users = {};
    for (let matchIdx = 0; matchIdx < leagueMatches.length; matchIdx++) {
      let userGoals = leagueMatches[matchIdx].score.split(":"),
        user1Id = leagueMatches[matchIdx].player1Id,
        user2Id = leagueMatches[matchIdx].player2Id;

      if (userGoals[0] === userGoals[1]) {
        if (users[user1Id]) users[user1Id].drawCount++;
        else
          users[user1Id] = {
            winsCount: 0,
            lossCount: 0,
            drawCount: 1,
          };

        if (users[user2Id]) users[user2Id].drawCount++;
        else
          users[user2Id] = {
            winsCount: 0,
            lossCount: 0,
            drawCount: 1,
          };
      } else if (userGoals[0] > userGoals[1]) {
        if (users[user1Id]) users[user1Id].winsCount++;
        else
          users[user1Id] = {
            winsCount: 1,
            lossCount: 0,
            drawCount: 0,
          };

        if (users[user2Id]) users[user2Id].lossCount++;
        else
          users[user2Id] = {
            winsCount: 0,
            lossCount: 1,
            drawCount: 0,
          };
      } else {
        if (users[user1Id]) users[user1Id].lossCount++;
        else
          users[user1Id] = {
            winsCount: 0,
            lossCount: 1,
            drawCount: 0,
          };

        if (users[user2Id]) users[user2Id].winsCount++;
        else
          users[user2Id] = {
            winsCount: 1,
            lossCount: 0,
            drawCount: 0,
          };
      }
    }

    let usersArray = [];
    for (const usersKey in users) {
      usersArray.push({
        id: +usersKey,
        winsCount: users[usersKey].winsCount,
        lossCount: users[usersKey].lossCount,
        drawCount: users[usersKey].drawCount,
      });
    }

    return usersArray;
  }

  async getCurrentMatch(userId) {
    let currentTime = new Date();
    let matchPlayTime = new Date(
      new Date().setHours(currentTime.getHours() + 2)
    );

    const match = await prisma.match.findFirst({
      select: {
        logs: true,
        time: true,
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
        OR: [
          {
            player1Id: userId,
            time: { lte: currentTime },
            time: { gte: matchPlayTime },
          },
          {
            player2Id: userId,
            time: { lte: currentTime },
            time: { gte: matchPlayTime },
          },
        ],
      },
      orderBy: {
        time: "asc",
      },
      take: 1,
    });

    if (!match) {
      return null;
    }

    console.log(match.player1.players);

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
      matchLogs: match.logs,
      matchStartTime: match.time,
      matchHasStarted: currentTime >= match.time,
    };

    return matchInfo;
  }
}

module.exports = new MathService();
