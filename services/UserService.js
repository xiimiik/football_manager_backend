const {prisma} = require("../prisma-client");

class UserService {
    async getUserProgress(id) {
        return await prisma.user.findFirst({
            where: {
                id
            },
            include: {
                players: {
                    select: {
                        playersJson: true,
                        waitingPlayersJson: true,
                    }
                }
            }
        });
    }

    async getUserCurrentLeagueMatches(id) {
        return await prisma.match.findMany({
            where: {
                OR: [
                    {
                        player1Id: id
                    },
                    {
                        player2Id: id
                    }
                ]
            }
        });
    }

    async updateUserProfile(id, name, abbr, logo) {
        try {
            await prisma.user.update({
                where: {
                    id
                },
                data: {
                    name,
                    abbr,
                    logo
                }
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async updateUserMoney(id, moneyType, amount) {
        try {
            await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    [moneyType]: amount
                }
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async updateUserAvatar(id, avatar) {
        try {
            await prisma.user.update({
                where: {
                    id
                },
                data: {
                    avatar
                }
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async updateUserPlayers(id, playersJson) {
        try {
            await prisma.user_players.upsert({
                create: {
                    userId: id,
                    playersJson
                },
                update: {
                    playersJson
                },
                where: {
                    userId: id
                },
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async updateUserWaitingPlayers(id, waitingPlayersJson) {
        try {
            await prisma.user_players.upsert({
                create: {
                    userId: id,
                    waitingPlayersJson
                },
                update: {
                    waitingPlayersJson
                },
                where: {
                    userId: id
                }
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async updateUserTempPlayer(id, tempPlayer) {
        try {
            await prisma.user_players.upsert({
                where: {
                    userId: id
                },
                create: {
                    userId: id,
                    tempPlayer
                },
                update: {
                    tempPlayer
                }
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async checkUserTempPlayer(id) {
        return await prisma.user_players.findFirst({
            select: {
                tempPlayer: true
            },
            where: {
                userId: id
            }
        });
    }

    async updateUserTempAction(id, tempAction) {
        try {
            await prisma.user_players.upsert({
                create: {
                    userId: id,
                    tempAction
                },
                update: {
                    tempAction
                },
                where: {
                    userId: id
                },
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async checkUserTempAction(id) {
        return await prisma.user_players.findFirst({
            select: {
                tempAction: true
            },
            where: {
                userId: id
            }
        });
    }

    async updateUserTempDialogs(id, tempDialogs) {
        try {
            await prisma.user_players.upsert({
                create: {
                    userId: id,
                    tempDialogs
                },
                update: {
                    tempDialogs
                },
                where: {
                    userId: id
                },
            });
            return true;
        }
        catch {
            return false;
        }
    }

    async checkUserTempDialogs(id) {
        return await prisma.user_players.findFirst({
            select: {
                tempDialogs: true
            },
            where: {
                userId: id
            }
        });
    }

    async getUserLastPlayedMatch(id) {
        return await prisma.match.findFirst({
            where: {
                OR: [
                    {player1Id: id},
                    {player2Id: id},
                ],
                AND: {
                    NOT: {
                        score: null
                    }
                }
            },
            orderBy: {
                time: 'desc'
            },
            take: 1
        });
    }
}

module.exports = new UserService();