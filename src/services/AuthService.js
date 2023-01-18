const { prisma } = require("../../prisma-client");

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

  async getUserProfileByAccountId(strategy, accountId) {
    return prisma.federated_credentials.findFirst({
      where: {
        strategy,
        accountId,
      },
    });
  }

  async linkupUserProfile(id, strategy, accountId) {
    try {
      await prisma.$transaction([
        prisma.federated_credentials.deleteMany({
          where: {
            strategy,
            userId: id,
          },
        }),
        prisma.federated_credentials.create({
          data: {
            strategy,
            accountId,
            userId: id,
          },
        }),
      ]);
      return true;
    } catch {
      return false;
    }
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
