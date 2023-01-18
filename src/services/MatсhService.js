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
}

module.exports = new MathService();
