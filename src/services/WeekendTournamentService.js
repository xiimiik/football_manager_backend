const { prisma } = require("../../prisma-client");

class WeekendTournamentService {
  async getUserWeekendLeague(id) {
    const leagueId = await prisma.weekend_league_players.findFirst({
      where: {
        playerId: id,
      },
      select: {
        leagueId: true,
      },
    });

    const nextLevelLeagueId = await prisma.weekend_league_players_next_level.findFirst({
      where: {
        playerId: id,
      },
      select: {
        leagueId: true,
      },
    });

    return {
      firstStage: {
        leagueId: leagueId.leagueId
      },
      secondStage: {
        leagueId: nextLevelLeagueId?.leagueId || null
      }
    }
  }

  async getUserWeekendMatches(id) {
    const matches = await prisma.weekend_match.findMany({
      where: {
        OR: [
          {
            user1_id: id,
          },
          {
            user2_id: id,
          },
        ],
      },
      select: {
        id: true,
        leagueId: true,
      },
    });

    const nextLevelMatches = await prisma.weekend_match_next_level.findMany({
      where: {
        OR: [
          {
            user1_id: id,
          },
          {
            user2_id: id,
          },
        ],
      },
      select: {
        id: true,
        leagueId: true,
      },
    });

    return {
      firstStage: matches,
      secondStage: nextLevelMatches,
    };
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

  async getLeagueLeaderboard(userId) {
    const matches = await prisma.weekend_league.findFirst({
      where: {
        weekendLeagueMatches: {
          some: {
            OR: [{ user1_id: userId }, { user2_id: userId }],
          },
        },
      },
      select: {
        id: true,
        weekendLeagueMatches: {
          select: {
            id: true,
            score: true,
            user1_id: true,
            user2_id: true,
          },
        },
      },
    });

    const nextLevelMatches = await prisma.weekend_league_next_level.findFirst({
      where: {
        weekendLeagueMatches: {
          some: {
            OR: [{ user1_id: userId }, { user2_id: userId }],
          },
        },
      },
      select: {
        id: true,
        weekendLeagueMatches: {
          select: {
            id: true,
            score: true,
            user1_id: true,
            user2_id: true,
          },
        },
      },
    });

    const winsCount = {};
    const nextStageWinsCount = {};
    let usersArray = [];
    let nextStageUsersArray = [];

    if (matches) {
      matches.weekendLeagueMatches.forEach((match) => {
        const [user1Score, user2Score] = match.score.split(":").map(Number);
        if (user1Score > user2Score) {
          winsCount[match.user1_id] = (winsCount[match.user1_id] || 0) + 1;
        } else if (user2Score > user1Score) {
          winsCount[match.user2_id] = (winsCount[match.user2_id] || 0) + 1;
        }
      });

      const allPlayers = new Set(matches.weekendLeagueMatches.flatMap((match) => [
        match.user1_id,
        match.user2_id,
      ].filter((id) => id !== userId)));
      

      usersArray = Array.from(allPlayers, (id) => ({
        id: +id,
        winsCount: winsCount[id] || 0,
      }));
    }

    if (nextLevelMatches) {
      nextLevelMatches.weekendLeagueMatches.forEach((match) => {
        const [user1Score, user2Score] = match.score.split(":").map(Number);
        if (user1Score > user2Score) {
          nextStageWinsCount[match.user1_id] = (nextStageWinsCount[match.user1_id] || 0) + 1;
        } else if (user2Score > user1Score) {
          nextStageWinsCount[match.user2_id] = (nextStageWinsCount[match.user2_id] || 0) + 1;
        }
      });
  
      nextStageUsersArray = Object.keys(nextStageWinsCount).map((id) => ({
        id: +id,
        winsCount: nextStageWinsCount[id],
      }));
    }
    
    return {
      firstStage: {
        leagueId: matches.id,
        users: usersArray,
      },
      secondStage: {
        leagueId: nextLevelMatches?.id || null,
        users: nextStageUsersArray,
      },
    };
  }
}

module.exports = new WeekendTournamentService();


// {
//   firstStage: {
//     first: [],
//     second: [],
//     second: [],
//   },
//   secondStage: {
//     leagueId: nextLevelMatches?.id || null,
//     users: nextStageUsersArray,
//   },
// }