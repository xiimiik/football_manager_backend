const {prisma} = require("../prisma-client");

class WeekendTournamentService {
    async getUserWeekendLeague(id) {
        // return await prisma.weekend_league.find({
        //     select: {
        //         id: true,
        //         region: {
        //             select: {
        //                 id: true,
        //                 name: true,
        //             }
        //         }
        //     }
        // });
    }

    async getUserWeekendMatches(id) {
        // return await prisma.weekend_league.find({
        //     select: {
        //         id: true,
        //         region: {
        //             select: {
        //                 id: true,
        //                 name: true,
        //             }
        //         }
        //     }
        // });
    }

    async getWeekendMatchesByPhase(phase) {
        return await prisma.weekend_match.findMany({
            select: {
                id: true,
            },
            where: {
                league: {
                    level: phase
                }
            }
        });
    }
}

module.exports = new WeekendTournamentService();