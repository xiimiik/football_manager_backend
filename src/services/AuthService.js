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

  async getBotByCountry(countryId) {
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
      return null;
    }

    const today = new Date();
    const lastMonday = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - ((today.getUTCDay() + 6) % 7),
        0,
        0,
        0
      )
    );

    const trainingJson = {
      isAvailable: false,
      training: [{
        date: lastMonday,
        points: 0,
        nonPassed: 21,
      }],
    };

    await prisma.user.update({
      where: {
        id: botId.id,
      },
      data: {
        isBot: false,
        training: JSON.stringify(trainingJson),
      },
    });

    return botId.id;
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
      return false;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return false;
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
