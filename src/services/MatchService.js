const { prisma } = require("../../prisma-client");
const { calculatePlayersTotalAsm_v2 } = require("../utils/debug.utils");

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
    const currentTime = new Date();
    const matchPlayTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
  
    const match = await prisma.match.findFirst({
      select: {
        logs: true,
        time: true,
        leagueId: true,
        player1: {
          select: {
            id: true,
            logo: true,
            name: true,
            avatarTb: { select: { id: true } },
            lastTeam: true,
          },
        },
        player2: {
          select: {
            id: true,
            logo: true,
            name: true,
            avatarTb: { select: { id: true } },
            lastTeam: true,
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
  
    const avatarDefying = await prisma.avatar_defying.findFirst({
      where: {
        OR: [
          {
            avatar_id: match.player1.avatarTb.id,
            defeated_id: match.player2.avatarTb.id,
          },
          {
            avatar_id: match.player2.avatarTb.id,
            defeated_id: match.player1.avatarTb.id,
          },
        ],
      },
      select: { defeated_id: true },
    });
  
    const avatarAdv = avatarDefying?.defeated_id === match.player1.avatarTb.id ? match.player1.avatarTb.id
      : avatarDefying?.defeated_id === match.player2.avatarTb.id ? match.player2.avatarTb.id
      : null;
  
    const squadAdv =
    Math.abs(calculatePlayersTotalAsm_v2(JSON.parse(match.player1.lastTeam))) - Math.abs(calculatePlayersTotalAsm_v2(JSON.parse(match.player2.lastTeam))) >= 8
      ? (calculatePlayersTotalAsm_v2(JSON.parse(match.player1.lastTeam)) > calculatePlayersTotalAsm_v2(JSON.parse(match.player2.lastTeam)) ? match.player1.id
        : calculatePlayersTotalAsm_v2(JSON.parse(match.player1.lastTeam)) < calculatePlayersTotalAsm_v2(JSON.parse(match.player2.lastTeam)) ? match.player2.id
        : null)
      : null;
    
    const matchInfo = {
      team1: {
        id: match.player1.id,
        logo: match.player1.logo,
        name: match.player1.name,
        avatar: match.player1.avatarTb.id,
        teamComposition: match.player1.lastTeam,
      },
      team2: {
        id: match.player2.id,
        logo: match.player2.logo,
        name: match.player2.name,
        avatar: match.player2.avatarTb.id,
        teamComposition: match.player2.lastTeam,
      },
      leagueId: match.leagueId,
      matchLogs: match.logs,
      matchStartTime: match.time,
      matchHasStarted: currentTime >= match.time,
      prematchScreen: {
        homeBonus: match.player1.id,
        avatarAdv,
        squadAdv,
      }
    };
  
    return matchInfo;
  }
  
}

module.exports = new MathService();
