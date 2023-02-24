const bcrypt = require("bcryptjs");
const { prisma } = require("../../prisma-client");
const ServerService = require("./ServerService");

class AuthService {
  async swapUserWithBot(botId) {
    try {
      await prisma.user.update({
        data: {
          isBot: false,
        },
        where: {
          id: botId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getUserProfileByAccountId(accountId) {
    return prisma.federated_credentials.findFirst({
      where: {
        accountId,
      },
    });
  }

  async getBotByCountry(regionId, countryId) {
    const botId = await prisma.user.findFirst({
      where: {
        AND: [
          {
            leaguePlayers: {
              some: {
                league: {
                  country_id: countryId,
                },
              },
            },
          },
          {
            isBot: true,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!botId) {
      await ServerService.generateServer(regionId);
      const userId = await prisma.user.findFirst({
        where: {
          AND: [
            {
              leaguePlayers: {
                some: {
                  league: {
                    country_id: countryId,
                  },
                },
              },
            },
            {
              isBot: true,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isBot: false,
        }
      })

      return userId;
    } else {
      return botId;
    }
  }

  async linkupUserProfile(email, password, accountId, botId) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await prisma.$transaction([
        prisma.federated_credentials.deleteMany({
          where: {
            userId: botId,
          },
        }),
        prisma.federated_credentials.create({
          data: {
            accountId,
            userId: botId,
            email,
            password: hashedPassword,
          },
        }),
        prisma.user.update({
          where: {
            id: botId,
          },
          data: {
            isBot: false,
          },
        }),
      ]);
      return botId;
    } catch {
      return false;
    }
  }

  async login(email, password) {
    const user = prisma.federated_credentials.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    return user.userId;
  }

  async reloadUserProfile(id, strategy, accountId) {
    try {
      await prisma.$transaction([
        prisma.federated_credentials.deleteMany({
          where: {
            strategy,
            userId: id,
          },
        }),
        prisma.federated_credentials.update({
          data: {
            userId: id,
          },
          where: {
            strategy_accountId: {
              strategy,
              accountId,
            },
          },
        }),
      ]);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new AuthService();
