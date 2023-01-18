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
}

module.exports = new LeagueService();
