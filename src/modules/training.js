const { prisma } = require("@prisma/client");

async function scheduleTrainingInterval() {
  const today = new Date();
  const nextMonday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + ((8 - today.getUTCDay()) % 7),
      0,
      0,
      0
    )
  );
  const millisecondsUntilMonday = nextMonday.getTime() - today.getTime();
  const oneWeeksMs = 1000 * 60 * 60 * 24 * 7;

  async function createTraining() {
    const dateTime = new Date();
    dateTime.setUTCHours(dateTime.getUTCHours(), 0, 0, 0);

    const users = await prisma.user.findMany({
      where: {
        isBot: false,
      },
      select: {
        id: true,
        training: true,
      },
    });

    const queries = [];

    for (const { training, id } of users) {
      const trainingJson = JSON.parse(training);
      trainingJson.training.push({
        date: dateTime,
        points: 0,
        nonPassed: 21,
      });

      queries.push(
        prisma.user.update({
          where: {
            id,
          },
          data: {
            training: JSON.stringify(trainingJson),
          },
        })
      );
    }

    await prisma.$transaction(queries);
  }

  setTimeout(async () => {
    await createTraining();
    setInterval(async () => {
      await createTraining();
    }, oneWeeksMs);
  }, millisecondsUntilMonday);
}

async function trainingModule() {
  try {
    await scheduleTrainingInterval();
  } catch (e) {
    console.log("Error:", e);
  }
}

module.exports = {
  trainingModule,
};
