const { prisma } = require("../../prisma-client");

class WeekendTournamentService {
  async getUserWeekendLeague(id) {
    return await prisma.weekend_league_players.findFirst({
      where: {
        playerId: id,
      },
      select: {
        leagueId: true,
      },
    });
  }

  async getUserWeekendMatches(id) {
    return await prisma.weekend_match.findMany({
      where: {
        OR: [
          {
            player1Id: id,
          },
          {
            player2Id: id,
          },
        ],
      },
      select: {
        id: true,
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getWeekendMatchesByPhase(phase) {
    if (phase <= 4) {
      return await prisma.weekend_match.findMany({
        select: {
          id: true,
        },
        where: {
          league: {
            level: phase,
          },
        },
      });
    } else {
      return await prisma.weekend_match_next_level.findMany({
        select: {
          id: true,
        },
        where: {
          league: {
            level: phase,
          },
        },
      });
    }
  }

  async getLeagueLeaderboard(leagueId) {
    const leagueMatches = await prisma.weekend_match.findMany({
      select: {
        user1_id: true,
        user2_id: true,
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
        user1Id = leagueMatches[matchIdx].user1_id,
        user2Id = leagueMatches[matchIdx].user2_id;

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

module.exports = new WeekendTournamentService();
