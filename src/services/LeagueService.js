const { prisma } = require("../../prisma-client");

class LeagueService {
  async getLeagueByInviteCode(inviteCode) {
    const userId = +inviteCode.substring(2);

    return prisma.league_players.findFirst({
      select: {
        leagueId: true,
      },
      where: {
        playerId: userId,
      },
    });
  }

  async getLeagueTeamsById(leagueId) {
    const MatchResult = Object.freeze({
      NotOverYet: "Not Over Yet",
      Won: "Won",
      Lost: "Lost",
      Draw: "Draw",
    });

    const teams = await prisma.user.findMany({
      where: {
        leaguePlayers: {
          some: {
            league: {
              id: leagueId,
            },
          },
        },
      },
      include: {
        leaguePlayers: {
          include: {
            league: {
              include: {
                leagueMatches: true,
              },
            },
          },
        },
        avatarTb: {
          select: {
            name: true,
          }
        }
      },
    });

    const teamsInfo = teams.map((team) => {
      const league = team.leaguePlayers[0].league;
      const leagueMatches = league.leagueMatches;

      const teamMatches = leagueMatches.filter(
        (match) => match.player1Id === team.id || match.player2Id === team.id
      );

      let points = 0;
      const lastFiveMatches = [];

      teamMatches.forEach((match) => {
        const score = match.score;
        if (score) {
          const scoreArr = score.split(":");
          const player1Score = parseInt(scoreArr[0]);
          const player2Score = parseInt(scoreArr[1]);

          if (match.player1Id === team.id) {
            if (player1Score > player2Score) {
              points += 3;
              lastFiveMatches.push(MatchResult.Won);
            } else if (player1Score === player2Score) {
              points += 1;
              lastFiveMatches.push(MatchResult.Draw);
            } else {
              lastFiveMatches.push(MatchResult.Lost);
            }
          } else {
            if (player2Score > player1Score) {
              points += 3;
              lastFiveMatches.push(MatchResult.Won);
            } else if (player1Score === player2Score) {
              points += 1;
              lastFiveMatches.push(MatchResult.Draw);
            } else {
              lastFiveMatches.push(MatchResult.Lost);
            }
          }
        }
      });

      return {
        place: null,
        logo: team.logo,
        avatar: team.avatarTb.name,
        name: team.name,
        points: points,
        lastFiveMatches: lastFiveMatches.slice(-5),
      };
    });

    // sort teams by points
    teamsInfo.sort((a, b) => b.points - a.points);

    // calculate place based on the points
    teamsInfo.forEach((team, index) => {
      team.place = index + 1;
    });

    return teamsInfo;
  }
}

module.exports = new LeagueService();
