const { prisma } = require("../../prisma-client.js");
const { avatarDefying } = require("../data/avatars");
const MathService = require("../services/MathService");
const {
  getUTCDateZeroTimestamp,
  getNextNeededWeekDayTimestamp,
} = require("../utils/dates.utils");

async function playDebugMatch_v_17otr_v1_penalty(matchId, saveToDB) {
  // debug functions ===================================================================================
  function getPlayerAsmParts(player) {
    let technicalSkills = {},
      physicalSkills = {};

    for (let skill in player.card.physicalSkills)
      physicalSkills[skill] = player.card.physicalSkills[skill];
    for (let skill in player.card.technicalSkills)
      technicalSkills[skill] = player.card.technicalSkills[skill];

    switch (player.position) {
      case "FW":
        technicalSkills.shoot *= 3;
        physicalSkills.pace *= 3;
        physicalSkills.agility *= 3;
        physicalSkills.jump *= 3;
        break;

      case "WG":
        technicalSkills.cross *= 3;
        technicalSkills.shoot *= 3;
        physicalSkills.pace *= 3;
        physicalSkills.agility *= 3;
        break;

      case "CM":
        technicalSkills.pass *= 3;
        physicalSkills.agility *= 3;
        physicalSkills.strength *= 3;
        break;

      case "CD":
        technicalSkills.tackling *= 3;
        physicalSkills.strength *= 3;
        physicalSkills.jump *= 3;
        break;

      case "WB":
        technicalSkills.cross *= 3;
        physicalSkills.pace *= 3;
        physicalSkills.jump *= 3;
        break;
    }

    //получение asm игрока =============================================
    let phy = 0,
      te = 0,
      skillsSum,
      positionBonus = -2,
      asm;

    for (let skill in physicalSkills) phy += physicalSkills[skill];
    for (let skill in technicalSkills) te += technicalSkills[skill];

    phy = Math.min(Math.max(-5, phy), 5);
    te = Math.min(Math.max(-5, te), 5);
    skillsSum = Math.min(Math.max(1, phy + te), 10);

    // если текущая игрока позиция подходит "preferedPosition" - бонус = +2
    switch (player.card.preferedPosition) {
      case "ATT":
        if (player.position === "FW" || player.position === "WG")
          positionBonus = 2;
        break;

      case "MID":
        if (player.position === "CM") positionBonus = 2;
        break;

      case "DEF":
        if (player.position === "CD" || player.position === "WB")
          positionBonus = 2;
        break;

      case "GK":
        if (player.position === "GK") positionBonus = 2;
        break;
    }

    // asm = skillsSum(phy + te [1-10]) + card mood [-3 - 3] + positionBonus[-2/2] + card reputation [-2/0/2] = [1-10]
    asm = Math.min(
      Math.max(
        1,
        skillsSum +
          player.card.mood +
          positionBonus +
          (match.league.level - player.card.playerReputation) * 2
      ),
      10
    );

    if (asm % 1 !== 0) asm += 0.5 * (player.card.mood < 0 ? -1 : 1);
    //получение asm игрока =============================================

    let asmString =
      `phy=${phy}, te=${te}, mood=${player.card.mood}, ` +
      `reputationBonus=${
        (match.league.level - player.card.playerReputation) * 2
      }, ` +
      `positionBonus=${positionBonus} ==> ` +
      `playerAsm=${asm}`;

    return asmString;
  }

  // debug functions ===================================================================================

  function sortPlayersByAverageRating(a, b) {
    if (a.card.isGoalKeeper) return 1;
    if (b.card.isGoalKeeper) return -1;

    if (a.card.averageRating < b.card.averageRating) return -1;
    if (a.card.averageRating > b.card.averageRating) return 1;

    return 0;
  }

  function findInjured_111(eventedUser, playersWithSkills, injuredPlayers) {
    let STAmPlayersCount = playersWithSkills.STAm.length,
      STAzPlayersCount = playersWithSkills.STAz.length,
      possibleInjuredPlayers = [],
      injuredPlayer;

    if (STAmPlayersCount) {
      for (let j = 0; j < playersWithSkills.STAm.length; j++) {
        let currPlayer = playersWithSkills.STAm[j];
        if (!injuredPlayers.includes(currPlayer.card.playerId))
          possibleInjuredPlayers.push(currPlayer);
      }
    }

    if (!possibleInjuredPlayers.length && STAzPlayersCount) {
      for (let j = 0; j < playersWithSkills.STAz.length; j++) {
        let currPlayer = playersWithSkills.STAz[j];
        if (!injuredPlayers.includes(currPlayer.card.playerId))
          possibleInjuredPlayers.push(currPlayer);
      }
    }

    if (!possibleInjuredPlayers.length) {
      for (let j = 0; j < 5; j++) {
        let currPlayer = eventedUser.players[j];
        if (!injuredPlayers.includes(currPlayer.card.playerId))
          possibleInjuredPlayers.push(currPlayer);
      }

      if (!possibleInjuredPlayers.length) {
        for (let j = 0; j < 5; j++)
          possibleInjuredPlayers.push(eventedUser.players[j]);
      }
    }

    injuredPlayer =
      possibleInjuredPlayers[
        MathService.randomInteger(0, possibleInjuredPlayers.length - 1)
      ];

    return injuredPlayer;
  }

  function findActed_111(anotherUser) {
    let actedPlayer =
      anotherUser.players[
        MathService.randomInteger(0, anotherUser.players.length - 2)
      ];

    return actedPlayer;
  }

  function calculatePlayerAsm(player) {
    let technicalSkills = {},
      physicalSkills = {};

    for (let skill in player.card.physicalSkills)
      physicalSkills[skill] = player.card.physicalSkills[skill];
    for (let skill in player.card.technicalSkills)
      technicalSkills[skill] = player.card.technicalSkills[skill];

    switch (player.position) {
      case "FW":
        technicalSkills.shoot *= 3;
        physicalSkills.pace *= 3;
        physicalSkills.agility *= 3;
        physicalSkills.jump *= 3;
        break;

      case "WG":
        technicalSkills.cross *= 3;
        technicalSkills.shoot *= 3;
        physicalSkills.pace *= 3;
        physicalSkills.agility *= 3;
        break;

      case "CM":
        technicalSkills.pass *= 3;
        physicalSkills.agility *= 3;
        physicalSkills.strength *= 3;
        break;

      case "CD":
        technicalSkills.tackling *= 3;
        physicalSkills.strength *= 3;
        physicalSkills.jump *= 3;
        break;

      case "WB":
        technicalSkills.cross *= 3;
        physicalSkills.pace *= 3;
        physicalSkills.jump *= 3;
        break;
    }

    //получение asm игрока =============================================
    let phy = 0,
      te = 0,
      skillsSum,
      positionBonus = -2,
      asm;

    for (let skill in physicalSkills) phy += physicalSkills[skill];
    for (let skill in technicalSkills) te += technicalSkills[skill];

    phy = Math.min(Math.max(-5, phy), 5);
    te = Math.min(Math.max(-5, te), 5);
    skillsSum = Math.min(Math.max(1, phy + te), 10);

    // если текущая игрока позиция подходит "preferedPosition" - бонус = +2
    switch (player.card.preferedPosition) {
      case "ATT":
        if (player.position === "FW" || player.position === "WG")
          positionBonus = 2;
        break;

      case "MID":
        if (player.position === "CM") positionBonus = 2;
        break;

      case "DEF":
        if (player.position === "CD" || player.position === "WB")
          positionBonus = 2;
        break;

      case "GK":
        if (player.position === "GK") positionBonus = 2;
        break;
    }

    // asm = skillsSum(phy + te [1-10]) + card mood [-3 - 3] + positionBonus[-2/2] + card reputation [-2/0/2] = [1-10]
    asm = Math.min(
      Math.max(
        1,
        skillsSum +
          player.card.mood +
          positionBonus +
          (match.league.level - player.card.playerReputation) * 2
      ),
      10
    );

    if (asm % 1 !== 0) asm += 0.5 * (player.card.mood < 0 ? -1 : 1);
    //получение asm игрока =============================================

    return asm;
  }

  const match = await prisma.weekend_match.findFirst({
    select: {
      id: true,
      user1: {
        select: {
          id: true,
          avatar: true,
          lastTactic: true,
          lastTeam: true,
          players: {
            select: {
              playersJson: true,
            },
          },
        },
      },
      user2: {
        select: {
          id: true,
          avatar: true,
          lastTactic: true,
          lastTeam: true,
          players: {
            select: {
              playersJson: true,
            },
          },
        },
      },
      league: {
        select: {
          level: true,
        },
      },
    },
    where: {
      id: matchId,
    },
  });

  let matchLogs = [],
    user1 = {
      id: match.user1.id,
      avatar: match.user1.avatar,
      tactic: JSON.parse(match.user1.lastTactic),
      players: [],
      resultLastTeam: JSON.parse(match.user1.lastTeam),
      resultAllPlayers: JSON.parse(match.user1.players.playersJson),
    },
    user2 = {
      id: match.user2.id,
      avatar: match.user1.avatar,
      tactic: JSON.parse(match.user1.lastTactic),
      players: [],
      resultLastTeam: JSON.parse(match.user1.lastTeam),
      resultAllPlayers: JSON.parse(match.user1.players.playersJson),
    },
    playersOnPositions = [
      {
        FW: [],
        WG: [],
        CM: [],
        WB: [],
        CD: [],
        GK: [],
      },
      {
        FW: [],
        WG: [],
        CM: [],
        WB: [],
        CD: [],
        GK: [],
      },
    ],
    playersWithSkills = [
      {
        AGIp: [],
        TCKLp: [],
        PASp: [],
        STAz: [],
        STAm: [],
        AGIm: [],
      },
      {
        AGIp: [],
        TCKLp: [],
        PASp: [],
        STAz: [],
        STAm: [],
        AGIm: [],
      },
    ],
    T = [0, 0],
    goals = [0, 0],
    eventsArrs = [[], []], //d
    debugLogs = {
      matchId: match.id,
      score: null,
      user1: {
        id: user1.id,
        players: user1.players,
        playersAsm: [],
        homeBonus: 3,
        avatarBonus: 0,
        T: 0,
      },
      user2: {
        id: user2.id,
        players: user2.players,
        playersAsm: [],
        homeBonus: 0,
        avatarBonus: 0,
        T: 0,
      },
    }; //d

  // заполнение массивов players ссылками на этих же игроков из resultAllPlayers =====================================
  function sortPlayersById_1(a, b) {
    if (a.playerId < b.playerId) return -1;
    if (a.playerId > b.playerId) return 1;
    return 0;
  }

  user1.resultLastTeam.sort(sortPlayersById_1);
  user2.resultLastTeam.sort(sortPlayersById_1);
  user1.resultAllPlayers.sort(sortPlayersById_1);
  user2.resultAllPlayers.sort(sortPlayersById_1);

  let rapPlIdx = 0;
  for (let ltPlIdx = 0; ltPlIdx < user1.resultLastTeam.length; ltPlIdx++) {
    while (
      user1.resultAllPlayers[rapPlIdx].playerId !==
      user1.resultLastTeam[ltPlIdx].playerId
    )
      rapPlIdx++;

    user1.resultAllPlayers[rapPlIdx].seasonRatingMarks.push(6.6); //начальная оценка за матч

    user1.players.push({
      card: user1.resultAllPlayers[rapPlIdx],
      position: {
        name: user1.resultLastTeam[ltPlIdx].position.split(":")[0],
        index: user1.resultLastTeam[ltPlIdx].position.split(":")[1],
      },
      asm: undefined,
    });
  }

  rapPlIdx = 0;
  for (let ltPlIdx = 0; ltPlIdx < user2.resultLastTeam.length; ltPlIdx++) {
    while (
      user2.resultAllPlayers[rapPlIdx].playerId !==
      user2.resultLastTeam[ltPlIdx].playerId
    )
      rapPlIdx++;

    user2.resultAllPlayers[rapPlIdx].seasonRatingMarks.push(6.6); //начальная оценка за матч

    user2.players.push({
      card: user2.resultAllPlayers[rapPlIdx],
      position: {
        name: user2.resultLastTeam[ltPlIdx].position.split(":")[0],
        index: user2.resultLastTeam[ltPlIdx].position.split(":")[1],
      },
      asm: undefined,
    });
  }

  user1.players.sort(sortPlayersByAverageRating);
  user2.players.sort(sortPlayersByAverageRating);
  // заполнение массивов players ссылками на этих же игроков из resultAllPlayers =====================================

  user1.players.forEach((player) => {
    // добавление игрока в массив игроков на {позиции}
    playersOnPositions[0][player.position.name].push(player);

    // добавление игрока в массивы со скиллами =========================================
    if (player.card.physicalSkills.agility > 0)
      playersWithSkills[0].AGIp.push(player);
    else if (player.card.physicalSkills.agility < 0)
      playersWithSkills[0].AGIm.push(player);

    if (player.card.technicalSkills.tackling > 0)
      playersWithSkills[0].TCKLp.push(player);

    if (player.card.technicalSkills.pass > 0)
      playersWithSkills[0].PASp.push(player);

    if (player.card.physicalSkills.stamina < 0)
      playersWithSkills[0].STAm.push(player);
    else if (player.card.physicalSkills.stamina === 0)
      playersWithSkills[0].STAz.push(player);
    // добавление игрока в массивы со скиллами =========================================

    let playerAsm = calculatePlayerAsm(player);
    T[0] += playerAsm;
    player.asm = playerAsm;

    debugLogs.user1.playersAsm.push({
      playerId: player.card.playerId,
      playerName: player.card.playerName,
      asmCalc: getPlayerAsmParts(player),
      asmSum: playerAsm,
    }); //d
  });
  user2.players.forEach((player) => {
    //распределение в массивах игроков на позициях
    playersOnPositions[1][player.position.name].push(player);

    // добавление игрока в массивы со скиллами =========================================
    if (player.card.physicalSkills.agility > 0)
      playersWithSkills[1].AGIp.push(player);
    else if (player.card.physicalSkills.agility < 0)
      playersWithSkills[1].AGIm.push(player);

    if (player.card.technicalSkills.tackling > 0)
      playersWithSkills[1].TCKLp.push(player);

    if (player.card.technicalSkills.pass > 0)
      playersWithSkills[1].PASp.push(player);

    if (player.card.physicalSkills.stamina < 0)
      playersWithSkills[1].STAm.push(player);
    else if (player.card.physicalSkills.stamina === 0)
      playersWithSkills[1].STAz.push(player);
    // добавление игрока в массивы со скиллами =========================================

    let playerAsm = calculatePlayerAsm(player);
    T[1] += playerAsm;
    player.asm = playerAsm;

    debugLogs.user2.playersAsm.push({
      playerId: player.card.playerId,
      playerName: player.card.playerName,
      asmCalc: getPlayerAsmParts(player),
      asmSum: playerAsm,
    }); //d
  });

  debugLogs.user1.T_players = T[0]; //d
  debugLogs.user2.T_players = T[1]; //d

  T[0] += 3; //доп очки за домашнюю тиму
  if (user1.avatar !== user2.avatar) {
    if (avatarDefying[user1.avatar].includes(user2.avatar)) {
      T[0] += 6;

      debugLogs.user1.avatarBonus = 3; //debug
    } else if (avatarDefying[user2.avatar].includes(user1.avatar)) {
      T[1] += 6;

      debugLogs.user2.avatarBonus = 3; //debug
    }
  } // доп очки за контр тренеров

  debugLogs.user1.T_players_bonuses = T[0]; //d
  debugLogs.user2.T_players_bonuses = T[1]; //d

  let advantage = Math.abs(T[0] - T[1]),
    momentsCount1 = {
      firstTime: [0, 0],
      secondTime: [0, 0],
    };

  if (advantage <= 8) {
    if (T[0] > T[1]) T[1] = T[0];
    else T[0] = T[1];

    momentsCount1.firstTime = [8, 8];
  } else {
    let user1MomCount = Math.round(T[0] / ((T[0] + T[1]) / 16));
    momentsCount1.firstTime = [user1MomCount, 16 - user1MomCount];
  }

  debugLogs.user1.T_players_bonuses_adv = T[0]; //d
  debugLogs.user2.T_players_bonuses_adv = T[1]; //d

  function changeRating(player, ratingDiff) {
    player.card.seasonRatingMarks[player.card.seasonRatingMarks.length - 1] =
      Number(
        (
          player.card.seasonRatingMarks[
            player.card.seasonRatingMarks.length - 1
          ] + ratingDiff
        ).toFixed(2)
      );
  }

  let xG = [0, 0],
    xG1 = [0, 0],
    xG2 = [0, 0],
    lastPotGoalMinute = null;

  matchLogs.push({
    minute: "0",
    user: null,
    momentType: null,
    result: "Match started!",
  });

  function getMoment(minute, availableMomentsCount, T, xG, xgTime, matchLogs) {
    let player = MathService.randomFloat(0, T[0] + T[1]) <= T[0] ? 0 : 1,
      randNum = MathService.randomInteger(1, 10),
      momentType =
        randNum >= 1 && randNum <= 2
          ? 13
          : randNum >= 3 && randNum <= 6
          ? 12
          : 11,
      momentWeight = 0.5 * (momentType - 9);

    if (availableMomentsCount[player] === 0) player = (player + 1) % 2;
    availableMomentsCount[player]--;

    T[player] += momentWeight; // чтобы получить вес 1/1.5/2 (11 -9. 12 - 9, 13 - 9)
    xG[player] += momentWeight;
    xgTime[player] += momentWeight;

    eventsArrs[player].push(momentType); //d

    matchLogs.push({
      minute,
      user: player,
      momentType,
      result: "",
    });
  }

  //первый тайм ===================================================================
  for (let i = 3; i <= 45; i += 3)
    getMoment(i.toString(), momentsCount1.firstTime, T, xG, xG1, matchLogs);
  getMoment(`45'add`, momentsCount1.firstTime, T, xG, xG1, matchLogs);

  xG1[0] /= 10;
  xG1[1] /= 10;
  //первый тайм ===================================================================

  eventsArrs[0].push("==="); //d
  eventsArrs[1].push("==="); //d

  advantage = Math.abs(T[0] - T[1]);
  if (advantage <= 8) momentsCount1.secondTime = [8, 8];
  else {
    let user1MomCount = Math.round(T[0] / ((T[0] + T[1]) / 16));
    momentsCount1.secondTime = [user1MomCount, 16 - user1MomCount];

    if (momentsCount1.secondTime[0] > momentsCount1.secondTime[1])
      momentsCount1.secondTime[1]++;
    else momentsCount1.secondTime[0]++;
  }

  //второй тайм ===================================================================
  for (let i = 45; i <= 90; i += 3)
    getMoment(i.toString(), momentsCount1.secondTime, T, xG, xG2, matchLogs);
  if (advantage > 8)
    getMoment(`90'add`, momentsCount1.secondTime, T, xG, xG2, matchLogs);

  xG2[0] /= 10;
  xG2[1] /= 10;
  //второй тайм ===================================================================

  // получение ивентов в матче ===============================================================================
  for (let i = matchLogs.length - 1; i > 0; i--) {
    if (matchLogs[i].momentType === 13) {
      lastPotGoalMinute = matchLogs[i].minute;
      break;
    }
  }

  let playersWithYellowCards = [[], []],
    injuredPlayers = [[], []],
    kickedPlayers = [[], []];

  xG[0] = xG1[0];
  xG[1] = xG1[1];

  for (let i = 1; i < matchLogs.length; i++) {
    // добавляем xG первого тайма
    if (i === 17) {
      xG[0] += xG2[0];
      xG[1] += xG2[1];
    }

    let event = matchLogs[i],
      eventCode,
      eventedUser,
      scoredUser,
      anotherUser,
      AGIpPlayersCount,
      TCKLpPlayersCount,
      PASpPlayersCount,
      AGImPlayersCount, // для удобства
      actedPlayer,
      possibleActedPlayers,
      injuredPlayer;

    switch (event.momentType) {
      case 11:
        eventedUser = event.user === 0 ? user1 : user2;
        anotherUser = event.user === 0 ? user2 : user1;

        eventCode = MathService.randomInteger(111, 115);

        switch (eventCode) {
          case 111:
            injuredPlayer = findInjured_111(
              eventedUser,
              playersWithSkills[event.user],
              injuredPlayers[event.user]
            );
            injuredPlayers[event.user].push(injuredPlayer.card.playerId);
            changeRating(injuredPlayer, -0.2);

            actedPlayer = findActed_111(anotherUser);
            actedPlayer.card.seasonYellowCardsCount++;
            changeRating(actedPlayer, -0.4);

            if (
              playersWithYellowCards[(event.user + 1) % 2].includes(
                actedPlayer.card.playerId
              )
            ) {
              kickedPlayers[(event.user + 1) % 2].push(actedPlayer);
              actedPlayer.card.unavailableMatchesCount = 2; // на 1 больше, ибо вконце разыгровки будет декремент

              // удаление из массива игроков
              for (let plIdx = 0; plIdx < anotherUser.players.length; plIdx++) {
                if (
                  anotherUser.players[plIdx].card.playerId ===
                  actedPlayer.card.playerId
                ) {
                  anotherUser.players.splice(plIdx, 1);
                  break;
                }
              }

              // удаление из игроков на позициях
              for (
                let plIdx = 0;
                plIdx <
                playersOnPositions[(event.user + 1) % 2][
                  actedPlayer.position.name
                ].length;
                plIdx++
              ) {
                if (
                  playersOnPositions[(event.user + 1) % 2][
                    actedPlayer.position.name
                  ][plIdx].card.playerId === actedPlayer.card.playerId
                ) {
                  playersOnPositions[(event.user + 1) % 2][
                    actedPlayer.position.name
                  ].splice(plIdx, 1);
                  break;
                }
              }

              // удаление из игроков по скиллах ===========================================================================
              if (actedPlayer.card.physicalSkills.agility > 0) {
                for (
                  let plIdx = 0;
                  plIdx < playersWithSkills[(event.user + 1) % 2].AGIp.length;
                  plIdx++
                ) {
                  if (
                    playersWithSkills[(event.user + 1) % 2].AGIp[plIdx].card
                      .playerId === actedPlayer.card.playerId
                  ) {
                    playersWithSkills[(event.user + 1) % 2].AGIp.splice(
                      plIdx,
                      1
                    );
                    break;
                  }
                }
              } else if (actedPlayer.card.physicalSkills.agility < 0) {
                for (
                  let plIdx = 0;
                  plIdx < playersWithSkills[(event.user + 1) % 2].AGIm.length;
                  plIdx++
                ) {
                  if (
                    playersWithSkills[(event.user + 1) % 2].AGIm[plIdx].card
                      .playerId === actedPlayer.card.playerId
                  ) {
                    playersWithSkills[(event.user + 1) % 2].AGIm.splice(
                      plIdx,
                      1
                    );
                    break;
                  }
                }
              }

              if (actedPlayer.card.physicalSkills.stamina === 0) {
                for (
                  let plIdx = 0;
                  plIdx < playersWithSkills[(event.user + 1) % 2].STAz.length;
                  plIdx++
                ) {
                  if (
                    playersWithSkills[(event.user + 1) % 2].STAz[plIdx]
                      .playerId === actedPlayer.playerId
                  ) {
                    playersWithSkills[(event.user + 1) % 2].STAz.splice(
                      plIdx,
                      1
                    );
                    break;
                  }
                }
              } else if (actedPlayer.card.physicalSkills.stamina < 0) {
                for (
                  let plIdx = 0;
                  plIdx < playersWithSkills[(event.user + 1) % 2].STAm.length;
                  plIdx++
                ) {
                  if (
                    playersWithSkills[(event.user + 1) % 2].STAm[plIdx].card
                      .playerId === actedPlayer.card.playerId
                  ) {
                    playersWithSkills[(event.user + 1) % 2].STAm.splice(
                      plIdx,
                      1
                    );
                    break;
                  }
                }
              }

              if (actedPlayer.card.technicalSkills.tackling > 0) {
                for (
                  let plIdx = 0;
                  plIdx < playersWithSkills[(event.user + 1) % 2].TCKLp.length;
                  plIdx++
                ) {
                  if (
                    playersWithSkills[(event.user + 1) % 2].TCKLp[plIdx].card
                      .playerId === actedPlayer.card.playerId
                  ) {
                    playersWithSkills[(event.user + 1) % 2].TCKLp.splice(
                      plIdx,
                      1
                    );
                    break;
                  }
                }
              }

              if (actedPlayer.card.technicalSkills.pass > 0) {
                for (
                  let plIdx = 0;
                  plIdx < playersWithSkills[(event.user + 1) % 2].PASp.length;
                  plIdx++
                ) {
                  if (
                    playersWithSkills[(event.user + 1) % 2].PASp[plIdx].card
                      .playerId === actedPlayer.card.playerId
                  ) {
                    playersWithSkills[(event.user + 1) % 2].PASp.splice(
                      plIdx,
                      1
                    );
                    break;
                  }
                }
              }
              // удаление из игроков по скиллах ===========================================================================

              // замена игрока в "последнем составе" ========================================================
              anotherUser.resultLastTeam.sort(sortPlayersById_1);
              anotherUser.resultAllPlayers.sort(sortPlayersById_1);

              let replacementPlayers = {
                  ATT: [],
                  MID: [],
                  DEF: [],
                },
                allPlIdx = 0,
                replacedPlayer = null;

              for (
                let ltPlIdx = 0;
                ltPlIdx < anotherUser.resultLastTeam.length;
                ltPlIdx++
              ) {
                while (
                  anotherUser.resultAllPlayers[allPlIdx].playerId !==
                  anotherUser.resultLastTeam[ltPlIdx].playerId
                ) {
                  if (
                    anotherUser.resultAllPlayers[allPlIdx]
                      .unavailableMatchesCount <= 1
                  )
                    replacementPlayers[
                      anotherUser.resultAllPlayers[allPlIdx].preferedPosition
                    ].push(anotherUser.resultAllPlayers[allPlIdx]);
                  allPlIdx++;
                }
                allPlIdx++;
              }

              if (
                actedPlayer.position.name === "FW" ||
                actedPlayer.position.name === "WG"
              ) {
                if (replacementPlayers.ATT.length)
                  replacedPlayer =
                    replacementPlayers.ATT[
                      MathService.randomInteger(
                        0,
                        replacementPlayers.ATT.length - 1
                      )
                    ];
                else {
                  let availablePlayers = [
                    ...replacementPlayers.MID,
                    ...replacementPlayers.DEF,
                  ];
                  replacedPlayer =
                    availablePlayers[
                      MathService.randomInteger(0, availablePlayers.length - 1)
                    ];
                }
              } else if (actedPlayer.position.name === "CM") {
                if (replacementPlayers.MID.length)
                  replacedPlayer =
                    replacementPlayers.MID[
                      MathService.randomInteger(
                        0,
                        replacementPlayers.MID.length - 1
                      )
                    ];
                else {
                  let availablePlayers = [
                    ...replacementPlayers.ATT,
                    ...replacementPlayers.DEF,
                  ];
                  replacedPlayer =
                    availablePlayers[
                      MathService.randomInteger(0, availablePlayers.length - 1)
                    ];
                }
              } else if (
                actedPlayer.position.name === "CD" ||
                actedPlayer.position.name === "WB"
              ) {
                if (replacementPlayers.DEF.length)
                  replacedPlayer =
                    replacementPlayers.DEF[
                      MathService.randomInteger(
                        0,
                        replacementPlayers.DEF.length - 1
                      )
                    ];
                else {
                  let availablePlayers = [
                    ...replacementPlayers.ATT,
                    ...replacementPlayers.MID,
                  ];
                  replacedPlayer =
                    availablePlayers[
                      MathService.randomInteger(0, availablePlayers.length - 1)
                    ];
                }
              }

              replacedPlayer = JSON.parse(JSON.stringify(replacedPlayer));
              replacedPlayer.position =
                actedPlayer.position.name + ":" + actedPlayer.position.index;

              for (
                let plIdx = 0;
                plIdx < anotherUser.resultLastTeam.length;
                plIdx++
              ) {
                if (
                  anotherUser.resultLastTeam[plIdx].playerId ===
                  actedPlayer.card.playerId
                ) {
                  anotherUser.resultLastTeam[plIdx] = replacedPlayer;
                  break;
                }
              }
              // замена игрока в "последнем составе" ========================================================

              // отдача всех 13 моментов противоположной команде ============================================
              for (let evIdx = i + 1; evIdx < matchLogs.length; evIdx++)
                if (
                  matchLogs[evIdx].momentType === 13 &&
                  matchLogs[evIdx].user === (event.user + 1) % 2
                )
                  matchLogs[evIdx].user = event.user;
              // отдача всех 13 моментов противоположной команде ============================================
            } else {
              playersWithYellowCards[(event.user + 1) % 2].push(
                actedPlayer.card.playerId
              );
              if (actedPlayer.card.seasonYellowCardsCount === 8) {
                actedPlayer.card.seasonYellowCardsCount = 0;
                actedPlayer.card.unavailableMatchesCount = 2; // на 1 больше, ибо вконце разыгровки будет декремент

                // замена игрока в "последнем составе" ========================================================
                anotherUser.resultLastTeam.sort(sortPlayersById_1);
                anotherUser.resultAllPlayers.sort(sortPlayersById_1);

                let replacementPlayers = {
                    ATT: [],
                    MID: [],
                    DEF: [],
                  },
                  allPlIdx = 0,
                  replacedPlayer = null;

                for (
                  let ltPlIdx = 0;
                  ltPlIdx < anotherUser.resultLastTeam.length;
                  ltPlIdx++
                ) {
                  while (
                    anotherUser.resultAllPlayers[allPlIdx].playerId !==
                    anotherUser.resultLastTeam[ltPlIdx].playerId
                  ) {
                    if (
                      anotherUser.resultAllPlayers[allPlIdx]
                        .unavailableMatchesCount <= 1
                    )
                      replacementPlayers[
                        anotherUser.resultAllPlayers[allPlIdx].preferedPosition
                      ].push(anotherUser.resultAllPlayers[allPlIdx]);
                    allPlIdx++;
                  }
                  allPlIdx++;
                }

                if (
                  actedPlayer.position.name === "FW" ||
                  actedPlayer.position.name === "WG"
                ) {
                  if (replacementPlayers.ATT.length)
                    replacedPlayer =
                      replacementPlayers.ATT[
                        MathService.randomInteger(
                          0,
                          replacementPlayers.ATT.length - 1
                        )
                      ];
                  else {
                    let availablePlayers = [
                      ...replacementPlayers.MID,
                      ...replacementPlayers.DEF,
                    ];
                    replacedPlayer =
                      availablePlayers[
                        MathService.randomInteger(
                          0,
                          availablePlayers.length - 1
                        )
                      ];
                  }
                } else if (actedPlayer.position.name === "CM") {
                  if (replacementPlayers.MID.length)
                    replacedPlayer =
                      replacementPlayers.MID[
                        MathService.randomInteger(
                          0,
                          replacementPlayers.MID.length - 1
                        )
                      ];
                  else {
                    let availablePlayers = [
                      ...replacementPlayers.ATT,
                      ...replacementPlayers.DEF,
                    ];
                    replacedPlayer =
                      availablePlayers[
                        MathService.randomInteger(
                          0,
                          availablePlayers.length - 1
                        )
                      ];
                  }
                } else if (
                  actedPlayer.position.name === "CD" ||
                  actedPlayer.position.name === "WB"
                ) {
                  if (replacementPlayers.DEF.length)
                    replacedPlayer =
                      replacementPlayers.DEF[
                        MathService.randomInteger(
                          0,
                          replacementPlayers.DEF.length - 1
                        )
                      ];
                  else {
                    let availablePlayers = [
                      ...replacementPlayers.ATT,
                      ...replacementPlayers.MID,
                    ];
                    replacedPlayer =
                      availablePlayers[
                        MathService.randomInteger(
                          0,
                          availablePlayers.length - 1
                        )
                      ];
                  }
                }

                replacedPlayer = JSON.parse(JSON.stringify(replacedPlayer));
                replacedPlayer.position =
                  actedPlayer.position.name + ":" + actedPlayer.position.index;

                for (
                  let plIdx = 0;
                  plIdx < anotherUser.resultLastTeam.length;
                  plIdx++
                ) {
                  if (
                    anotherUser.resultLastTeam[plIdx].playerId ===
                    actedPlayer.card.playerId
                  ) {
                    anotherUser.resultLastTeam[plIdx] = replacedPlayer;
                    break;
                  }
                }
                // замена игрока в "последнем составе" ========================================================
              }
            }

            event.result = `${injuredPlayer.card.playerName} is injured - ${actedPlayer.card.playerName} will be punished by a yellow card`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: -0.4,
              },
              {
                playerId: injuredPlayer.card.playerId,
                playerName: injuredPlayer.card.playerName,
                position: injuredPlayer.position.name,
                ratingDiff: -0.2,
              },
            ];
            break;

          case 112:
            AGImPlayersCount = playersWithSkills[event.user].AGIm.length;

            if (AGImPlayersCount)
              actedPlayer =
                playersWithSkills[event.user].AGIm[
                  MathService.randomInteger(0, AGImPlayersCount - 1)
                ];
            else
              actedPlayer =
                eventedUser.players[MathService.randomInteger(0, 4)];
            changeRating(actedPlayer, -0.2);

            event.result = `Unlucky dribbling - ${actedPlayer.card.playerName}`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: -0.2,
              },
            ];
            break;

          case 113:
            possibleActedPlayers = [
              ...playersOnPositions[event.user].WG,
              ...playersOnPositions[event.user].WB,
            ];

            if (possibleActedPlayers.length)
              actedPlayer =
                possibleActedPlayers[
                  MathService.randomInteger(0, possibleActedPlayers.length - 1)
                ];
            else
              actedPlayer =
                eventedUser.players[
                  MathService.randomInteger(0, eventedUser.players.length - 2)
                ];
            changeRating(actedPlayer, -0.2);

            event.result = `Unlucky cross - ${actedPlayer.card.playerName}`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: -0.2,
              },
            ];
            break;

          case 114:
            event.result = `Slow passing in the midfield`;
            event.players = [];
            break;

          case 115:
            actedPlayer = eventedUser.players[MathService.randomInteger(0, 4)];
            changeRating(actedPlayer, -0.2);

            event.result = `${actedPlayer.card.playerName} made a mistake`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: -0.2,
              },
            ];
            break;
        }
        break;

      case 12:
        eventedUser = event.user === 0 ? user1 : user2;
        anotherUser = event.user === 0 ? user2 : user1;

        eventCode = MathService.randomInteger(121, 125);

        switch (eventCode) {
          case 121:
            actedPlayer =
              eventedUser.players[
                MathService.randomInteger(0, eventedUser.players.length - 2)
              ];

            event.result = `Shot off target`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: 0,
              },
            ];
            break;

          case 122:
            AGIpPlayersCount = playersWithSkills[event.user].AGIp.length;

            if (AGIpPlayersCount)
              actedPlayer =
                playersWithSkills[event.user].AGIp[
                  MathService.randomInteger(0, AGIpPlayersCount - 1)
                ];
            else
              actedPlayer =
                eventedUser.players[
                  MathService.randomInteger(
                    eventedUser.players.length - 6,
                    eventedUser.players.length - 2
                  )
                ];
            changeRating(actedPlayer, 0.2);

            event.result = `Successful dribbling by ${actedPlayer.card.playerName}`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: 0.2,
              },
            ];
            break;

          case 123:
            possibleActedPlayers = [
              ...playersOnPositions[event.user].WG,
              ...playersOnPositions[event.user].WB,
            ];
            possibleActedPlayers.sort(function (a, b) {
              if (a.card.averageRating < b.card.averageRating) return -1;
              if (a.card.averageRating > b.card.averageRating) return 1;
              return 0;
            });

            actedPlayer = possibleActedPlayers[possibleActedPlayers.length - 1];
            changeRating(actedPlayer, 0.2);

            event.result = `Promising cross by ${actedPlayer.card.playerName}`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: 0.2,
              },
            ];
            break;

          case 124:
            TCKLpPlayersCount = playersWithSkills[event.user].TCKLp.length;

            if (TCKLpPlayersCount)
              actedPlayer =
                playersWithSkills[event.user].TCKLp[
                  MathService.randomInteger(0, TCKLpPlayersCount - 1)
                ];
            else
              actedPlayer =
                eventedUser.players[
                  MathService.randomInteger(
                    eventedUser.players.length - 6,
                    eventedUser.players.length - 2
                  )
                ];
            changeRating(actedPlayer, 0.2);

            event.result = `Interception by ${actedPlayer.card.playerName}`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: 0.2,
              },
            ];
            break;

          case 125:
            PASpPlayersCount = playersWithSkills[event.user].PASp.length;

            if (PASpPlayersCount)
              actedPlayer =
                playersWithSkills[event.user].PASp[
                  MathService.randomInteger(0, PASpPlayersCount - 1)
                ];
            else {
              playersOnPositions[event.user].CM.sort(function (a, b) {
                if (a.card.averageRating < b.card.averageRating) return -1;
                if (a.card.averageRating > b.card.averageRating) return 1;
                return 0;
              });
              actedPlayer =
                playersOnPositions[event.user].CM[
                  playersOnPositions[event.user].CM.length - 1
                ];
            }

            changeRating(actedPlayer, 0.2);

            event.result = `Promising through pass by ${actedPlayer.card.playerName}`;
            event.players = [
              {
                playerId: actedPlayer.card.playerId,
                playerName: actedPlayer.card.playerName,
                position: actedPlayer.position.name,
                ratingDiff: 0.2,
              },
            ];
            break;
        }
        break;

      case 13:
        let chanceNumbers = Math.floor(xG[event.user] / 0.25);

        if (event.minute === lastPotGoalMinute && goals[0] === goals[1])
          chanceNumbers++;

        let randNumbers = MathService.randomInteger(1, 10),
          goal = randNumbers <= chanceNumbers ? 1 : 0;

        if (goal) {
          let scoredPlayer, assistantPlayer, possibleScoredPlayers;

          scoredUser = event.user === 0 ? user1 : user2;
          anotherUser = event.user === 0 ? user2 : user1;

          goals[event.user]++;
          xG[event.user] = Math.max(0, xG[event.user] - 1); //чтобы xG игрока не был меньше 0

          switch (scoredUser.tactic.teamFocus) {
            case "wing-play":
              if (MathService.randomInteger(1, 3) <= 2) {
                eventCode = 131;

                if (playersOnPositions[event.user].FW.length) {
                  scoredPlayer = playersOnPositions[event.user].FW[0];

                  let avgTeamAsm = 0;
                  for (let j = 0; j < scoredUser.players.length; j++)
                    avgTeamAsm += scoredUser.players[j].asm;
                  avgTeamAsm /= scoredUser.players.length;

                  if (scoredPlayer.asm > avgTeamAsm) {
                    if (playersOnPositions[event.user].WG.length) {
                      let scPlIdx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].WG.length - 1
                      );

                      scoredPlayer = playersOnPositions[event.user].WG[scPlIdx];

                      if (playersOnPositions[event.user].WG.length >= 2)
                        assistantPlayer =
                          playersOnPositions[event.user].WG[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].WG.length - 1,
                              [scPlIdx]
                            )
                          ];
                      else if (playersOnPositions[event.user].CM.length)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].CM.length - 1
                            )
                          ];
                    } else if (playersOnPositions[event.user].CM.length) {
                      let scPlIdx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].CM.length - 1
                      );

                      scoredPlayer = playersOnPositions[event.user].CM[scPlIdx];

                      if (playersOnPositions[event.user].CM.length >= 2)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].CM.length - 1,
                              [scPlIdx]
                            )
                          ];
                      else if (playersOnPositions[event.user].WB.length)
                        assistantPlayer =
                          playersOnPositions[event.user].WB[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].WB.length - 1
                            )
                          ];
                    }
                  } else {
                    if (playersOnPositions[event.user].WG.length)
                      assistantPlayer =
                        playersOnPositions[event.user].WG[
                          MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].WG.length - 1
                          )
                        ];
                    else if (playersOnPositions[event.user].CM.length)
                      assistantPlayer =
                        playersOnPositions[event.user].CM[
                          MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].CM.length - 1
                          )
                        ];
                  }
                } else if (playersOnPositions[event.user].WG.length) {
                  let idx = MathService.randomInteger(
                    0,
                    playersOnPositions[event.user].WG.length - 1
                  );
                  scoredPlayer = playersOnPositions[event.user].WG[idx];

                  if (playersOnPositions[event.user].WG.length > 1)
                    assistantPlayer =
                      playersOnPositions[event.user].WG[
                        MathService.randomIntegerExcluding(
                          0,
                          playersOnPositions[event.user].WG.length - 1,
                          [idx]
                        )
                      ];
                  else if (playersOnPositions[event.user].CM.length)
                    assistantPlayer =
                      playersOnPositions[event.user].CM[
                        MathService.randomInteger(
                          0,
                          playersOnPositions[event.user].WG.length - 1
                        )
                      ];
                } else if (playersOnPositions[event.user].CM.length) {
                  let idx = MathService.randomInteger(
                    0,
                    playersOnPositions[event.user].CM.length - 1
                  );
                  scoredPlayer = playersOnPositions[event.user].CM[idx];

                  if (playersOnPositions[event.user].CM.length > 1)
                    assistantPlayer =
                      playersOnPositions[event.user].CM[
                        MathService.randomIntegerExcluding(
                          0,
                          playersOnPositions[event.user].CM.length - 1,
                          [idx]
                        )
                      ];
                  else if (
                    playersOnPositions[event.user].CD.length ||
                    playersOnPositions[event.user].WB.length
                  ) {
                    let possiblePlayers = [
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    assistantPlayer =
                      possiblePlayers[
                        MathService.randomInteger(0, possiblePlayers.length - 1)
                      ];
                  }
                }

                changeRating(scoredPlayer, 0.8);
                changeRating(assistantPlayer, 0.8);

                for (
                  let playerIndex = 0;
                  playerIndex < scoredUser.players.length;
                  playerIndex++
                ) {
                  let currPlayer = scoredUser.players[playerIndex];
                  if (
                    currPlayer !== scoredPlayer &&
                    currPlayer !== assistantPlayer
                  )
                    changeRating(currPlayer, 0.2);
                }

                event.result = `${scoredPlayer.card.playerName} scores a header delivered by ${assistantPlayer.card.playerName}`;
                event.players = [
                  {
                    playerId: scoredPlayer.card.playerId,
                    playerName: scoredPlayer.card.playerName,
                    position: scoredPlayer.position.name,
                    role: "player",
                    ratingDiff: 0.8,
                  },
                  {
                    playerId: assistantPlayer.card.playerId,
                    playerName: assistantPlayer.card.playerName,
                    position: assistantPlayer.position.name,
                    role: "assistant",
                    ratingDiff: 0.8,
                  },
                  {
                    playerName: "Scored team players",
                    position: "Scored team positions",
                    role: "none",
                    ratingDiff: 0.2,
                  },
                ];
              } else {
                eventCode = MathService.randomInteger(131, 136);

                switch (eventCode) {
                  case 131:
                    if (playersOnPositions[event.user].FW.length) {
                      scoredPlayer = playersOnPositions[event.user].FW[0];

                      let avgTeamAsm = 0;
                      for (let j = 0; j < scoredUser.players.length; j++)
                        avgTeamAsm += scoredUser.players[j].asm;
                      avgTeamAsm /= scoredUser.players.length;

                      if (scoredPlayer.asm > avgTeamAsm) {
                        if (playersOnPositions[event.user].WG.length) {
                          let scPlIdx = MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].WG.length - 1
                          );

                          scoredPlayer =
                            playersOnPositions[event.user].WG[scPlIdx];

                          if (playersOnPositions[event.user].WG.length >= 2)
                            assistantPlayer =
                              playersOnPositions[event.user].WG[
                                MathService.randomIntegerExcluding(
                                  0,
                                  playersOnPositions[event.user].WG.length - 1,
                                  [scPlIdx]
                                )
                              ];
                          else if (playersOnPositions[event.user].CM.length)
                            assistantPlayer =
                              playersOnPositions[event.user].CM[
                                MathService.randomInteger(
                                  0,
                                  playersOnPositions[event.user].CM.length - 1
                                )
                              ];
                        } else if (playersOnPositions[event.user].CM.length) {
                          let scPlIdx = MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].CM.length - 1
                          );

                          scoredPlayer =
                            playersOnPositions[event.user].CM[scPlIdx];

                          if (playersOnPositions[event.user].CM.length >= 2)
                            assistantPlayer =
                              playersOnPositions[event.user].CM[
                                MathService.randomIntegerExcluding(
                                  0,
                                  playersOnPositions[event.user].CM.length - 1,
                                  [scPlIdx]
                                )
                              ];
                          else if (playersOnPositions[event.user].WB.length)
                            assistantPlayer =
                              playersOnPositions[event.user].WB[
                                MathService.randomInteger(
                                  0,
                                  playersOnPositions[event.user].WB.length - 1
                                )
                              ];
                        }
                      } else {
                        if (playersOnPositions[event.user].WG.length)
                          assistantPlayer =
                            playersOnPositions[event.user].WG[
                              MathService.randomInteger(
                                0,
                                playersOnPositions[event.user].WG.length - 1
                              )
                            ];
                        else if (playersOnPositions[event.user].CM.length)
                          assistantPlayer =
                            playersOnPositions[event.user].CM[
                              MathService.randomInteger(
                                0,
                                playersOnPositions[event.user].CM.length - 1
                              )
                            ];
                      }
                    } else if (playersOnPositions[event.user].WG.length) {
                      let idx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].WG.length - 1
                      );
                      scoredPlayer = playersOnPositions[event.user].WG[idx];

                      if (playersOnPositions[event.user].WG.length > 1)
                        assistantPlayer =
                          playersOnPositions[event.user].WG[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].WG.length - 1,
                              [idx]
                            )
                          ];
                      else if (playersOnPositions[event.user].CM.length)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].WG.length - 1
                            )
                          ];
                    } else if (playersOnPositions[event.user].CM.length) {
                      let idx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].CM.length - 1
                      );
                      scoredPlayer = playersOnPositions[event.user].CM[idx];

                      if (playersOnPositions[event.user].CM.length > 1)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].CM.length - 1,
                              [idx]
                            )
                          ];
                      else if (
                        playersOnPositions[event.user].CD.length ||
                        playersOnPositions[event.user].WB.length
                      ) {
                        let possiblePlayers = [
                          ...playersOnPositions[event.user].CD,
                          ...playersOnPositions[event.user].WB,
                        ];
                        assistantPlayer =
                          possiblePlayers[
                            MathService.randomInteger(
                              0,
                              possiblePlayers.length - 1
                            )
                          ];
                      }
                    }

                    changeRating(scoredPlayer, 0.8);
                    changeRating(assistantPlayer, 0.8);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (
                        currPlayer !== scoredPlayer &&
                        currPlayer !== assistantPlayer
                      )
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `${scoredPlayer.card.playerName} scores a header delivered by ${assistantPlayer.card.playerName}`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.8,
                      },
                      {
                        playerId: assistantPlayer.card.playerId,
                        playerName: assistantPlayer.card.playerName,
                        position: assistantPlayer.position.name,
                        role: "assistant",
                        ratingDiff: 0.8,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 132:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 0.4);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `Spectacular powershot by ${scoredPlayer.card.playerName}`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.4,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 133:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 1);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `${scoredPlayer.card.playerName} scores after solo breakthrough`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 1,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 134:
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      // scoredPlayer = (FW|WG)
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];

                      // assistantPlayer = CM
                      if (playersOnPositions[event.user].CM.length) {
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].CM.length - 1
                            )
                          ];
                      }
                      // assistantPlayer = (CD|WB)
                      else {
                        let possibleAssistedPlayers = [
                          ...playersOnPositions[event.user].CD,
                          ...playersOnPositions[event.user].WB,
                        ];
                        assistantPlayer =
                          possibleAssistedPlayers[
                            MathService.randomInteger(
                              0,
                              possibleAssistedPlayers.length - 1
                            )
                          ];
                      }
                    } else {
                      // scoredPlayer = CM
                      let idx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].CM.length - 1
                      );
                      scoredPlayer = playersOnPositions[event.user].CM[idx];

                      // assistantPlayer = (CD|WB)
                      if (
                        playersOnPositions[event.user].CD.length ||
                        playersOnPositions[event.user].WB.length
                      ) {
                        let possibleAssistedPlayers = [
                          ...playersOnPositions[event.user].CD,
                          ...playersOnPositions[event.user].WB,
                        ];
                        assistantPlayer =
                          possibleAssistedPlayers[
                            MathService.randomInteger(
                              0,
                              possibleAssistedPlayers.length - 1
                            )
                          ];
                      }
                      // assistantPlayer = CM
                      else {
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].CM.length - 1,
                              [idx]
                            )
                          ];
                      }
                    }

                    changeRating(scoredPlayer, 0.8);
                    changeRating(assistantPlayer, 0.8);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (
                        currPlayer !== scoredPlayer &&
                        currPlayer !== assistantPlayer
                      )
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `Goal! ${scoredPlayer.card.playerName} runs and ${assistantPlayer.card.playerName} provides an assist`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.8,
                      },
                      {
                        playerId: assistantPlayer.card.playerId,
                        playerName: assistantPlayer.card.playerName,
                        position: assistantPlayer.position.name,
                        role: "assistant",
                        ratingDiff: 0.8,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 135:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 1);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `Goal! ${scoredPlayer.card.playerName} used opponent’s silly mistake`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 1,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 136:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 0.8);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.5);
                    }

                    event.result = `Goal! Brilliant team-play finished by ${scoredPlayer.card.playerName}`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.8,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.5,
                      },
                    ];
                    break;
                }
              }
              break;

            case "midfield":
              if (MathService.randomInteger(1, 3) <= 2) {
                eventCode = 134;

                if (
                  playersOnPositions[event.user].FW.length ||
                  playersOnPositions[event.user].WG.length
                ) {
                  // scoredPlayer = (FW|WG)
                  possibleScoredPlayers = [
                    ...playersOnPositions[event.user].FW,
                    ...playersOnPositions[event.user].WG,
                  ];
                  scoredPlayer =
                    possibleScoredPlayers[
                      MathService.randomInteger(
                        0,
                        possibleScoredPlayers.length - 1
                      )
                    ];

                  // assistantPlayer = CM
                  if (playersOnPositions[event.user].CM.length) {
                    assistantPlayer =
                      playersOnPositions[event.user].CM[
                        MathService.randomInteger(
                          0,
                          playersOnPositions[event.user].CM.length - 1
                        )
                      ];
                  }
                  // assistantPlayer = (CD|WB)
                  else {
                    let possibleAssistedPlayers = [
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    assistantPlayer =
                      possibleAssistedPlayers[
                        MathService.randomInteger(
                          0,
                          possibleAssistedPlayers.length - 1
                        )
                      ];
                  }
                } else {
                  // scoredPlayer = CM
                  let idx = MathService.randomInteger(
                    0,
                    playersOnPositions[event.user].CM.length - 1
                  );
                  scoredPlayer = playersOnPositions[event.user].CM[idx];

                  // assistantPlayer = (CD|WB)
                  if (
                    playersOnPositions[event.user].CD.length ||
                    playersOnPositions[event.user].WB.length
                  ) {
                    let possibleAssistedPlayers = [
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    assistantPlayer =
                      possibleAssistedPlayers[
                        MathService.randomInteger(
                          0,
                          possibleAssistedPlayers.length - 1
                        )
                      ];
                  }
                  // assistantPlayer = CM
                  else {
                    assistantPlayer =
                      playersOnPositions[event.user].CM[
                        MathService.randomIntegerExcluding(
                          0,
                          playersOnPositions[event.user].CM.length - 1,
                          [idx]
                        )
                      ];
                  }
                }

                changeRating(scoredPlayer, 0.8);
                changeRating(assistantPlayer, 0.8);

                for (
                  let playerIndex = 0;
                  playerIndex < scoredUser.players.length;
                  playerIndex++
                ) {
                  let currPlayer = scoredUser.players[playerIndex];
                  if (
                    currPlayer !== scoredPlayer &&
                    currPlayer !== assistantPlayer
                  )
                    changeRating(currPlayer, 0.2);
                }

                event.result = `Goal! ${scoredPlayer.card.playerName} runs and ${assistantPlayer.card.playerName} provides an assist`;
                event.players = [
                  {
                    playerId: scoredPlayer.card.playerId,
                    playerName: scoredPlayer.card.playerName,
                    position: scoredPlayer.position.name,
                    role: "player",
                    ratingDiff: 0.8,
                  },
                  {
                    playerId: assistantPlayer.card.playerId,
                    playerName: assistantPlayer.card.playerName,
                    position: assistantPlayer.position.name,
                    role: "assistant",
                    ratingDiff: 0.8,
                  },
                  {
                    playerName: "Scored team players",
                    position: "Scored team positions",
                    role: "none",
                    ratingDiff: 0.2,
                  },
                ];
              } else {
                eventCode = MathService.randomInteger(131, 136);

                switch (eventCode) {
                  case 131:
                    if (playersOnPositions[event.user].FW.length) {
                      scoredPlayer = playersOnPositions[event.user].FW[0];

                      let avgTeamAsm = 0;
                      for (let j = 0; j < scoredUser.players.length; j++)
                        avgTeamAsm += scoredUser.players[j].asm;
                      avgTeamAsm /= scoredUser.players.length;

                      if (scoredPlayer.asm > avgTeamAsm) {
                        if (playersOnPositions[event.user].WG.length) {
                          let scPlIdx = MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].WG.length - 1
                          );

                          scoredPlayer =
                            playersOnPositions[event.user].WG[scPlIdx];

                          if (playersOnPositions[event.user].WG.length >= 2)
                            assistantPlayer =
                              playersOnPositions[event.user].WG[
                                MathService.randomIntegerExcluding(
                                  0,
                                  playersOnPositions[event.user].WG.length - 1,
                                  [scPlIdx]
                                )
                              ];
                          else if (playersOnPositions[event.user].CM.length)
                            assistantPlayer =
                              playersOnPositions[event.user].CM[
                                MathService.randomInteger(
                                  0,
                                  playersOnPositions[event.user].CM.length - 1
                                )
                              ];
                        } else if (playersOnPositions[event.user].CM.length) {
                          let scPlIdx = MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].CM.length - 1
                          );

                          scoredPlayer =
                            playersOnPositions[event.user].CM[scPlIdx];

                          if (playersOnPositions[event.user].CM.length >= 2)
                            assistantPlayer =
                              playersOnPositions[event.user].CM[
                                MathService.randomIntegerExcluding(
                                  0,
                                  playersOnPositions[event.user].CM.length - 1,
                                  [scPlIdx]
                                )
                              ];
                          else if (playersOnPositions[event.user].WB.length)
                            assistantPlayer =
                              playersOnPositions[event.user].WB[
                                MathService.randomInteger(
                                  0,
                                  playersOnPositions[event.user].WB.length - 1
                                )
                              ];
                        }
                      } else {
                        if (playersOnPositions[event.user].WG.length)
                          assistantPlayer =
                            playersOnPositions[event.user].WG[
                              MathService.randomInteger(
                                0,
                                playersOnPositions[event.user].WG.length - 1
                              )
                            ];
                        else if (playersOnPositions[event.user].CM.length)
                          assistantPlayer =
                            playersOnPositions[event.user].CM[
                              MathService.randomInteger(
                                0,
                                playersOnPositions[event.user].CM.length - 1
                              )
                            ];
                      }
                    } else if (playersOnPositions[event.user].WG.length) {
                      let idx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].WG.length - 1
                      );
                      scoredPlayer = playersOnPositions[event.user].WG[idx];

                      if (playersOnPositions[event.user].WG.length > 1)
                        assistantPlayer =
                          playersOnPositions[event.user].WG[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].WG.length - 1,
                              [idx]
                            )
                          ];
                      else if (playersOnPositions[event.user].CM.length)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].WG.length - 1
                            )
                          ];
                    } else if (playersOnPositions[event.user].CM.length) {
                      let idx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].CM.length - 1
                      );
                      scoredPlayer = playersOnPositions[event.user].CM[idx];

                      if (playersOnPositions[event.user].CM.length > 1)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].CM.length - 1,
                              [idx]
                            )
                          ];
                      else if (
                        playersOnPositions[event.user].CD.length ||
                        playersOnPositions[event.user].WB.length
                      ) {
                        let possiblePlayers = [
                          ...playersOnPositions[event.user].CD,
                          ...playersOnPositions[event.user].WB,
                        ];
                        assistantPlayer =
                          possiblePlayers[
                            MathService.randomInteger(
                              0,
                              possiblePlayers.length - 1
                            )
                          ];
                      }
                    }

                    changeRating(scoredPlayer, 0.8);
                    changeRating(assistantPlayer, 0.8);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (
                        currPlayer !== scoredPlayer &&
                        currPlayer !== assistantPlayer
                      )
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `${scoredPlayer.card.playerName} scores a header delivered by ${assistantPlayer.card.playerName}`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.8,
                      },
                      {
                        playerId: assistantPlayer.card.playerId,
                        playerName: assistantPlayer.card.playerName,
                        position: assistantPlayer.position.name,
                        role: "assistant",
                        ratingDiff: 0.8,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 132:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 0.4);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `Spectacular powershot by ${scoredPlayer.card.playerName}`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.4,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 133:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 1);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `${scoredPlayer.card.playerName} scores after solo breakthrough`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 1,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 134:
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      // scoredPlayer = (FW|WG)
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];

                      // assistantPlayer = CM
                      if (playersOnPositions[event.user].CM.length) {
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].CM.length - 1
                            )
                          ];
                      }
                      // assistantPlayer = (CD|WB)
                      else {
                        let possibleAssistedPlayers = [
                          ...playersOnPositions[event.user].CD,
                          ...playersOnPositions[event.user].WB,
                        ];
                        assistantPlayer =
                          possibleAssistedPlayers[
                            MathService.randomInteger(
                              0,
                              possibleAssistedPlayers.length - 1
                            )
                          ];
                      }
                    } else {
                      // scoredPlayer = CM
                      let idx = MathService.randomInteger(
                        0,
                        playersOnPositions[event.user].CM.length - 1
                      );
                      scoredPlayer = playersOnPositions[event.user].CM[idx];

                      // assistantPlayer = (CD|WB)
                      if (
                        playersOnPositions[event.user].CD.length ||
                        playersOnPositions[event.user].WB.length
                      ) {
                        let possibleAssistedPlayers = [
                          ...playersOnPositions[event.user].CD,
                          ...playersOnPositions[event.user].WB,
                        ];
                        assistantPlayer =
                          possibleAssistedPlayers[
                            MathService.randomInteger(
                              0,
                              possibleAssistedPlayers.length - 1
                            )
                          ];
                      }
                      // assistantPlayer = CM
                      else {
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomIntegerExcluding(
                              0,
                              playersOnPositions[event.user].CM.length - 1,
                              [idx]
                            )
                          ];
                      }
                    }

                    changeRating(scoredPlayer, 0.8);
                    changeRating(assistantPlayer, 0.8);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (
                        currPlayer !== scoredPlayer &&
                        currPlayer !== assistantPlayer
                      )
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `Goal! ${scoredPlayer.card.playerName} runs and ${assistantPlayer.card.playerName} provides an assist`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.8,
                      },
                      {
                        playerId: assistantPlayer.card.playerId,
                        playerName: assistantPlayer.card.playerName,
                        position: assistantPlayer.position.name,
                        role: "assistant",
                        ratingDiff: 0.8,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 135:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 1);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.2);
                    }

                    event.result = `Goal! ${scoredPlayer.card.playerName} used opponent’s silly mistake`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 1,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.2,
                      },
                    ];
                    break;

                  case 136:
                    // scoredPlayer = (FW|WG)
                    if (
                      playersOnPositions[event.user].FW.length ||
                      playersOnPositions[event.user].WG.length
                    ) {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].FW,
                        ...playersOnPositions[event.user].WG,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }
                    // scoredPlayer = (CM|CD|WB)
                    else {
                      possibleScoredPlayers = [
                        ...playersOnPositions[event.user].CM,
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      scoredPlayer =
                        possibleScoredPlayers[
                          MathService.randomInteger(
                            0,
                            possibleScoredPlayers.length - 1
                          )
                        ];
                    }

                    changeRating(scoredPlayer, 0.8);

                    for (
                      let playerIndex = 0;
                      playerIndex < scoredUser.players.length;
                      playerIndex++
                    ) {
                      let currPlayer = scoredUser.players[playerIndex];
                      if (currPlayer !== scoredPlayer)
                        changeRating(currPlayer, 0.5);
                    }

                    event.result = `Goal! Brilliant team-play finished by ${scoredPlayer.card.playerName}`;
                    event.players = [
                      {
                        playerId: scoredPlayer.card.playerId,
                        playerName: scoredPlayer.card.playerName,
                        position: scoredPlayer.position.name,
                        role: "player",
                        ratingDiff: 0.8,
                      },
                      {
                        playerName: "Scored team players",
                        position: "Scored team positions",
                        role: "none",
                        ratingDiff: 0.5,
                      },
                    ];
                    break;
                }
              }
              break;

            case "stepUp":
              eventCode = MathService.randomInteger(131, 136);

              switch (eventCode) {
                case 131:
                  if (playersOnPositions[event.user].FW.length) {
                    scoredPlayer = playersOnPositions[event.user].FW[0];

                    let avgTeamAsm = 0;
                    for (let j = 0; j < scoredUser.players.length; j++)
                      avgTeamAsm += scoredUser.players[j].asm;
                    avgTeamAsm /= scoredUser.players.length;

                    if (scoredPlayer.asm > avgTeamAsm) {
                      if (playersOnPositions[event.user].WG.length) {
                        let scPlIdx = MathService.randomInteger(
                          0,
                          playersOnPositions[event.user].WG.length - 1
                        );

                        scoredPlayer =
                          playersOnPositions[event.user].WG[scPlIdx];

                        if (playersOnPositions[event.user].WG.length >= 2)
                          assistantPlayer =
                            playersOnPositions[event.user].WG[
                              MathService.randomIntegerExcluding(
                                0,
                                playersOnPositions[event.user].WG.length - 1,
                                [scPlIdx]
                              )
                            ];
                        else if (playersOnPositions[event.user].CM.length)
                          assistantPlayer =
                            playersOnPositions[event.user].CM[
                              MathService.randomInteger(
                                0,
                                playersOnPositions[event.user].CM.length - 1
                              )
                            ];
                      } else if (playersOnPositions[event.user].CM.length) {
                        let scPlIdx = MathService.randomInteger(
                          0,
                          playersOnPositions[event.user].CM.length - 1
                        );

                        scoredPlayer =
                          playersOnPositions[event.user].CM[scPlIdx];

                        if (playersOnPositions[event.user].CM.length >= 2)
                          assistantPlayer =
                            playersOnPositions[event.user].CM[
                              MathService.randomIntegerExcluding(
                                0,
                                playersOnPositions[event.user].CM.length - 1,
                                [scPlIdx]
                              )
                            ];
                        else if (playersOnPositions[event.user].WB.length)
                          assistantPlayer =
                            playersOnPositions[event.user].WB[
                              MathService.randomInteger(
                                0,
                                playersOnPositions[event.user].WB.length - 1
                              )
                            ];
                      }
                    } else {
                      if (playersOnPositions[event.user].WG.length)
                        assistantPlayer =
                          playersOnPositions[event.user].WG[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].WG.length - 1
                            )
                          ];
                      else if (playersOnPositions[event.user].CM.length)
                        assistantPlayer =
                          playersOnPositions[event.user].CM[
                            MathService.randomInteger(
                              0,
                              playersOnPositions[event.user].CM.length - 1
                            )
                          ];
                    }
                  } else if (playersOnPositions[event.user].WG.length) {
                    let idx = MathService.randomInteger(
                      0,
                      playersOnPositions[event.user].WG.length - 1
                    );
                    scoredPlayer = playersOnPositions[event.user].WG[idx];

                    if (playersOnPositions[event.user].WG.length > 1)
                      assistantPlayer =
                        playersOnPositions[event.user].WG[
                          MathService.randomIntegerExcluding(
                            0,
                            playersOnPositions[event.user].WG.length - 1,
                            [idx]
                          )
                        ];
                    else if (playersOnPositions[event.user].CM.length)
                      assistantPlayer =
                        playersOnPositions[event.user].CM[
                          MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].WG.length - 1
                          )
                        ];
                  } else if (playersOnPositions[event.user].CM.length) {
                    let idx = MathService.randomInteger(
                      0,
                      playersOnPositions[event.user].CM.length - 1
                    );
                    scoredPlayer = playersOnPositions[event.user].CM[idx];

                    if (playersOnPositions[event.user].CM.length > 1)
                      assistantPlayer =
                        playersOnPositions[event.user].CM[
                          MathService.randomIntegerExcluding(
                            0,
                            playersOnPositions[event.user].CM.length - 1,
                            [idx]
                          )
                        ];
                    else if (
                      playersOnPositions[event.user].CD.length ||
                      playersOnPositions[event.user].WB.length
                    ) {
                      let possiblePlayers = [
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      assistantPlayer =
                        possiblePlayers[
                          MathService.randomInteger(
                            0,
                            possiblePlayers.length - 1
                          )
                        ];
                    }
                  }

                  changeRating(scoredPlayer, 0.8);
                  changeRating(assistantPlayer, 0.8);

                  for (
                    let playerIndex = 0;
                    playerIndex < scoredUser.players.length;
                    playerIndex++
                  ) {
                    let currPlayer = scoredUser.players[playerIndex];
                    if (
                      currPlayer !== scoredPlayer &&
                      currPlayer !== assistantPlayer
                    )
                      changeRating(currPlayer, 0.2);
                  }

                  event.result = `${scoredPlayer.card.playerName} scores a header delivered by ${assistantPlayer.card.playerName}`;
                  event.players = [
                    {
                      playerId: scoredPlayer.card.playerId,
                      playerName: scoredPlayer.card.playerName,
                      position: scoredPlayer.position.name,
                      role: "player",
                      ratingDiff: 0.8,
                    },
                    {
                      playerId: assistantPlayer.card.playerId,
                      playerName: assistantPlayer.card.playerName,
                      position: assistantPlayer.position.name,
                      role: "assistant",
                      ratingDiff: 0.8,
                    },
                    {
                      playerName: "Scored team players",
                      position: "Scored team positions",
                      role: "none",
                      ratingDiff: 0.2,
                    },
                  ];
                  break;

                case 132:
                  // scoredPlayer = (FW|WG)
                  if (
                    playersOnPositions[event.user].FW.length ||
                    playersOnPositions[event.user].WG.length
                  ) {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].FW,
                      ...playersOnPositions[event.user].WG,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }
                  // scoredPlayer = (CM|CD|WB)
                  else {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].CM,
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }

                  changeRating(scoredPlayer, 0.4);

                  for (
                    let playerIndex = 0;
                    playerIndex < scoredUser.players.length;
                    playerIndex++
                  ) {
                    let currPlayer = scoredUser.players[playerIndex];
                    if (currPlayer !== scoredPlayer)
                      changeRating(currPlayer, 0.2);
                  }

                  event.result = `Spectacular powershot by ${scoredPlayer.card.playerName}`;
                  event.players = [
                    {
                      playerId: scoredPlayer.card.playerId,
                      playerName: scoredPlayer.card.playerName,
                      position: scoredPlayer.position.name,
                      role: "player",
                      ratingDiff: 0.4,
                    },
                    {
                      playerName: "Scored team players",
                      position: "Scored team positions",
                      role: "none",
                      ratingDiff: 0.2,
                    },
                  ];
                  break;

                case 133:
                  // scoredPlayer = (FW|WG)
                  if (
                    playersOnPositions[event.user].FW.length ||
                    playersOnPositions[event.user].WG.length
                  ) {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].FW,
                      ...playersOnPositions[event.user].WG,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }
                  // scoredPlayer = (CM|CD|WB)
                  else {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].CM,
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }

                  changeRating(scoredPlayer, 1);

                  for (
                    let playerIndex = 0;
                    playerIndex < scoredUser.players.length;
                    playerIndex++
                  ) {
                    let currPlayer = scoredUser.players[playerIndex];
                    if (currPlayer !== scoredPlayer)
                      changeRating(currPlayer, 0.2);
                  }

                  event.result = `${scoredPlayer.card.playerName} scores after solo breakthrough`;
                  event.players = [
                    {
                      playerId: scoredPlayer.card.playerId,
                      playerName: scoredPlayer.card.playerName,
                      position: scoredPlayer.position.name,
                      role: "player",
                      ratingDiff: 1,
                    },
                    {
                      playerName: "Scored team players",
                      position: "Scored team positions",
                      role: "none",
                      ratingDiff: 0.2,
                    },
                  ];
                  break;

                case 134:
                  if (
                    playersOnPositions[event.user].FW.length ||
                    playersOnPositions[event.user].WG.length
                  ) {
                    // scoredPlayer = (FW|WG)
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].FW,
                      ...playersOnPositions[event.user].WG,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];

                    // assistantPlayer = CM
                    if (playersOnPositions[event.user].CM.length) {
                      assistantPlayer =
                        playersOnPositions[event.user].CM[
                          MathService.randomInteger(
                            0,
                            playersOnPositions[event.user].CM.length - 1
                          )
                        ];
                    }
                    // assistantPlayer = (CD|WB)
                    else {
                      let possibleAssistedPlayers = [
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      assistantPlayer =
                        possibleAssistedPlayers[
                          MathService.randomInteger(
                            0,
                            possibleAssistedPlayers.length - 1
                          )
                        ];
                    }
                  } else {
                    // scoredPlayer = CM
                    let idx = MathService.randomInteger(
                      0,
                      playersOnPositions[event.user].CM.length - 1
                    );
                    scoredPlayer = playersOnPositions[event.user].CM[idx];

                    // assistantPlayer = (CD|WB)
                    if (
                      playersOnPositions[event.user].CD.length ||
                      playersOnPositions[event.user].WB.length
                    ) {
                      let possibleAssistedPlayers = [
                        ...playersOnPositions[event.user].CD,
                        ...playersOnPositions[event.user].WB,
                      ];
                      assistantPlayer =
                        possibleAssistedPlayers[
                          MathService.randomInteger(
                            0,
                            possibleAssistedPlayers.length - 1
                          )
                        ];
                    }
                    // assistantPlayer = CM
                    else {
                      assistantPlayer =
                        playersOnPositions[event.user].CM[
                          MathService.randomIntegerExcluding(
                            0,
                            playersOnPositions[event.user].CM.length - 1,
                            [idx]
                          )
                        ];
                    }
                  }

                  changeRating(scoredPlayer, 0.8);
                  changeRating(assistantPlayer, 0.8);

                  for (
                    let playerIndex = 0;
                    playerIndex < scoredUser.players.length;
                    playerIndex++
                  ) {
                    let currPlayer = scoredUser.players[playerIndex];
                    if (
                      currPlayer !== scoredPlayer &&
                      currPlayer !== assistantPlayer
                    )
                      changeRating(currPlayer, 0.2);
                  }

                  event.result = `Goal! ${scoredPlayer.card.playerName} runs and ${assistantPlayer.card.playerName} provides an assist`;
                  event.players = [
                    {
                      playerId: scoredPlayer.card.playerId,
                      playerName: scoredPlayer.card.playerName,
                      position: scoredPlayer.position.name,
                      role: "player",
                      ratingDiff: 0.8,
                    },
                    {
                      playerId: assistantPlayer.card.playerId,
                      playerName: assistantPlayer.card.playerName,
                      position: assistantPlayer.position.name,
                      role: "assistant",
                      ratingDiff: 0.8,
                    },
                    {
                      playerName: "Scored team players",
                      position: "Scored team positions",
                      role: "none",
                      ratingDiff: 0.2,
                    },
                  ];
                  break;

                case 135:
                  // scoredPlayer = (FW|WG)
                  if (
                    playersOnPositions[event.user].FW.length ||
                    playersOnPositions[event.user].WG.length
                  ) {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].FW,
                      ...playersOnPositions[event.user].WG,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }
                  // scoredPlayer = (CM|CD|WB)
                  else {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].CM,
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }

                  changeRating(scoredPlayer, 1);

                  for (
                    let playerIndex = 0;
                    playerIndex < scoredUser.players.length;
                    playerIndex++
                  ) {
                    let currPlayer = scoredUser.players[playerIndex];
                    if (currPlayer !== scoredPlayer)
                      changeRating(currPlayer, 0.2);
                  }

                  event.result = `Goal! ${scoredPlayer.card.playerName} used opponent’s silly mistake`;
                  event.players = [
                    {
                      playerId: scoredPlayer.card.playerId,
                      playerName: scoredPlayer.card.playerName,
                      position: scoredPlayer.position.name,
                      role: "player",
                      ratingDiff: 1,
                    },
                    {
                      playerName: "Scored team players",
                      position: "Scored team positions",
                      role: "none",
                      ratingDiff: 0.2,
                    },
                  ];
                  break;

                case 136:
                  // scoredPlayer = (FW|WG)
                  if (
                    playersOnPositions[event.user].FW.length ||
                    playersOnPositions[event.user].WG.length
                  ) {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].FW,
                      ...playersOnPositions[event.user].WG,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }
                  // scoredPlayer = (CM|CD|WB)
                  else {
                    possibleScoredPlayers = [
                      ...playersOnPositions[event.user].CM,
                      ...playersOnPositions[event.user].CD,
                      ...playersOnPositions[event.user].WB,
                    ];
                    scoredPlayer =
                      possibleScoredPlayers[
                        MathService.randomInteger(
                          0,
                          possibleScoredPlayers.length - 1
                        )
                      ];
                  }

                  changeRating(scoredPlayer, 0.8);

                  for (
                    let playerIndex = 0;
                    playerIndex < scoredUser.players.length;
                    playerIndex++
                  ) {
                    let currPlayer = scoredUser.players[playerIndex];
                    if (currPlayer !== scoredPlayer)
                      changeRating(currPlayer, 0.5);
                  }

                  event.result = `Goal! Brilliant team-play finished by ${scoredPlayer.card.playerName}`;
                  event.players = [
                    {
                      playerId: scoredPlayer.card.playerId,
                      playerName: scoredPlayer.card.playerName,
                      position: scoredPlayer.position.name,
                      role: "player",
                      ratingDiff: 0.8,
                    },
                    {
                      playerName: "Scored team players",
                      position: "Scored team positions",
                      role: "none",
                      ratingDiff: 0.5,
                    },
                  ];
                  break;
              }
              break;
          }

          //поиск виноватого игрока ================================================
          let value = Math.random(),
            anotherUserIdx = (event.user + 1) % 2,
            guiltPlayer;

          if (value <= 0.15)
            guiltPlayer = playersOnPositions[anotherUserIdx].GK[0];
          else if (value <= 0.3) {
            let possibleGuiltPlayers = [
              ...playersOnPositions[anotherUserIdx].FW,
              ...playersOnPositions[anotherUserIdx].WG,
            ];
            guiltPlayer =
              possibleGuiltPlayers[
                MathService.randomInteger(0, possibleGuiltPlayers.length - 1)
              ];
          } else if (value <= 0.6)
            guiltPlayer =
              playersOnPositions[anotherUserIdx].CM[
                MathService.randomInteger(
                  0,
                  playersOnPositions[anotherUserIdx].CM.length - 1
                )
              ];
          else {
            let possibleGuiltPlayers = [
              ...playersOnPositions[anotherUserIdx].CD,
              ...playersOnPositions[anotherUserIdx].WB,
            ];
            guiltPlayer =
              possibleGuiltPlayers[
                MathService.randomInteger(0, possibleGuiltPlayers.length - 1)
              ];
          }

          changeRating(guiltPlayer, -0.2);

          event.players.push({
            playerId: guiltPlayer.card.playerId,
            playerName: guiltPlayer.card.playerName,
            position: guiltPlayer.position.name,
            role: "guilt",
            ratingDiff: -0.2,
          });
          //поиск виноватого игрока ================================================

          // -0.2 пропустившим гол игрокам
          for (
            let playerIndex = 0;
            playerIndex < anotherUser.players.length;
            playerIndex++
          )
            changeRating(anotherUser.players[playerIndex], -0.2);
          event.players.push({
            playerName: "Another team players",
            position: "Another team positions",
            role: "none",
            ratingDiff: -0.2,
          });
        } else {
          eventCode = 130;

          let anotherUser = event.user === 0 ? user2 : user1;

          actedPlayer = anotherUser.players[anotherUser.players.length - 1];
          changeRating(actedPlayer, 0.4);

          event.result = `Shot on target`;
          event.players = [
            {
              playerId: actedPlayer.card.playerId,
              playerName: actedPlayer.card.playerName,
              position: actedPlayer.position.name,
              ratingDiff: 0.4,
            },
          ];
        }
        break;
    }

    event.code = eventCode;
    event.score = goals[0] + "-" + goals[1];
  }
  // получение ивентов в матче ===============================================================================

  // penalty shootout if score is equal
  if (goals[0] === goals[1]) {
    function sortPlayersByMood(a, b) {
      if (a.card.isGoalKeeper) return 1;
      if (b.card.isGoalKeeper) return -1;

      if (a.card.mood > b.card.mood) return -1;
      if (a.card.mood < b.card.mood) return 1;
      return 0;
    }

    user1.players.sort(sortPlayersByMood);
    user2.players.sort(sortPlayersByMood);

    let shootingPlayer, goalkeeper, goalChances;

    // first 5 shots
    for (let shotNum = 0; shotNum < 5; shotNum++) {
      // 1 user shot ==============================================
      shootingPlayer = user1.players[shotNum];
      goalkeeper = user2.players[user2.players.length - 1];

      if (goalkeeper.card.mood < -1) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.8; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.9; //shPl = b
        else goalChances = 0.95; //shPl = a
      } else if (goalkeeper.card.mood < 2) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.7; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.8; //shPl = b
        else goalChances = 0.9; //shPl = a
      } else {
        if (shootingPlayer.card.mood < -1) goalChances = 0.6; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.7; //shPl = b
        else goalChances = 0.8; //shPl = a
      }
      if (Math.random() <= goalChances) goals[0]++;
      // 1 user shot ==============================================

      // 2 user shot ==============================================
      shootingPlayer = user2.players[shotNum];
      goalkeeper = user1.players[user1.players.length - 1];

      if (goalkeeper.card.mood < -1) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.8; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.9; //shPl = b
        else goalChances = 0.95; //shPl = a
      } else if (goalkeeper.card.mood < 2) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.7; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.8; //shPl = b
        else goalChances = 0.9; //shPl = a
      } else {
        if (shootingPlayer.card.mood < -1) goalChances = 0.6; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.7; //shPl = b
        else goalChances = 0.8; //shPl = a
      }
      if (Math.random() <= goalChances) goals[1]++;
      // 2 user shot ==============================================

      if (Math.abs(goals[0] - goals[1]) > 4 - shotNum) break;
    }

    //if penalty got draw
    let shotPlayer1Idx = 0,
      shotPlayer2Idx = 0;
    while (goals[0] === goals[1]) {
      // 1 user shot ==============================================
      shootingPlayer = user1.players[shotPlayer1Idx];
      goalkeeper = user2.players[user2.players.length - 1];

      if (goalkeeper.card.mood < -1) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.8; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.9; //shPl = b
        else goalChances = 0.95; //shPl = a
      } else if (goalkeeper.card.mood < 2) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.7; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.8; //shPl = b
        else goalChances = 0.9; //shPl = a
      } else {
        if (shootingPlayer.card.mood < -1) goalChances = 0.6; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.7; //shPl = b
        else goalChances = 0.8; //shPl = a
      }
      if (Math.random() <= goalChances) goals[0]++;
      // 1 user shot ==============================================

      // 2 user shot ==============================================
      shootingPlayer = user2.players[shotPlayer2Idx];
      goalkeeper = user1.players[user1.players.length - 1];

      if (goalkeeper.card.mood < -1) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.8; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.9; //shPl = b
        else goalChances = 0.95; //shPl = a
      } else if (goalkeeper.card.mood < 2) {
        if (shootingPlayer.card.mood < -1) goalChances = 0.7; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.8; //shPl = b
        else goalChances = 0.9; //shPl = a
      } else {
        if (shootingPlayer.card.mood < -1) goalChances = 0.6; //shPl = c
        else if (shootingPlayer.card.mood < 2) goalChances = 0.7; //shPl = b
        else goalChances = 0.8; //shPl = a
      }
      if (Math.random() <= goalChances) goals[1]++;
      // 2 user shot ==============================================

      shotPlayer1Idx = ((shotPlayer1Idx + 1) % user1.players.length) - 1;
      shotPlayer2Idx = ((shotPlayer2Idx + 1) % user2.players.length) - 1;
    }
  }

  // рассчёт рейтинга игроков за сезон (среднее арифм)===========================
  for (let playerIndex = 0; playerIndex < user1.players.length; playerIndex++) {
    let sumOfMarks = 0;

    for (
      let marksIndex = 0;
      marksIndex < user1.players[playerIndex].card.seasonRatingMarks.length;
      marksIndex++
    ) {
      sumOfMarks +=
        user1.players[playerIndex].card.seasonRatingMarks[marksIndex];
    }

    user1.players[playerIndex].card.averageRating = Number(
      (
        sumOfMarks / user1.players[playerIndex].card.seasonRatingMarks.length
      ).toFixed(2)
    );
  }

  for (
    let playerIndex = 0;
    playerIndex < kickedPlayers[0].length;
    playerIndex++
  ) {
    let sumOfMarks = 0;

    for (
      let marksIndex = 0;
      marksIndex < kickedPlayers[0][playerIndex].card.seasonRatingMarks.length;
      marksIndex++
    ) {
      sumOfMarks +=
        kickedPlayers[0][playerIndex].card.seasonRatingMarks[marksIndex];
    }

    kickedPlayers[0][playerIndex].card.averageRating = Number(
      (
        sumOfMarks / kickedPlayers[0][playerIndex].card.seasonRatingMarks.length
      ).toFixed(2)
    );
  }

  for (let playerIndex = 0; playerIndex < user2.players.length; playerIndex++) {
    let sumOfMarks = 0;

    for (
      let marksIndex = 0;
      marksIndex < user2.players[playerIndex].card.seasonRatingMarks.length;
      marksIndex++
    ) {
      sumOfMarks +=
        user2.players[playerIndex].card.seasonRatingMarks[marksIndex];
    }

    user2.players[playerIndex].card.averageRating = Number(
      (
        sumOfMarks / user2.players[playerIndex].card.seasonRatingMarks.length
      ).toFixed(2)
    );
  }

  for (
    let playerIndex = 0;
    playerIndex < kickedPlayers[1].length;
    playerIndex++
  ) {
    let sumOfMarks = 0;

    for (
      let marksIndex = 0;
      marksIndex < kickedPlayers[1][playerIndex].card.seasonRatingMarks.length;
      marksIndex++
    ) {
      sumOfMarks +=
        kickedPlayers[1][playerIndex].card.seasonRatingMarks[marksIndex];
    }

    kickedPlayers[1][playerIndex].card.averageRating = Number(
      (
        sumOfMarks / kickedPlayers[1][playerIndex].card.seasonRatingMarks.length
      ).toFixed(2)
    );
  }
  // рассчёт рейтинга игроков за сезон (среднее арифм)===========================

  // изменение статуса unavailable для всех игроков юзеров===========================
  for (let plIdx = 0; plIdx < user1.resultAllPlayers.length; plIdx++) {
    let currPlayer = user1.resultAllPlayers[plIdx];
    if (currPlayer.unavailableMatchesCount > 0)
      currPlayer.unavailableMatchesCount--;
  }

  for (let plIdx = 0; plIdx < user2.resultAllPlayers.length; plIdx++) {
    let currPlayer = user2.resultAllPlayers[plIdx];
    if (currPlayer.unavailableMatchesCount > 0)
      currPlayer.unavailableMatchesCount--;
  }
  // изменение статуса unavailable для всех игроков юзеров===========================

  user1.players = user1.players.concat(kickedPlayers[0]);
  user2.players = user2.players.concat(kickedPlayers[1]);

  let resultLogs = {
    user1: {
      id: user1.id,
      players: user1.players.map((player) => {
        return {
          playerId: player.card.playerId,
          playerName: player.card.playerName,
          head: player.card.head,
          body: player.card.body,
          clothing: player.card.clothing,
          hair: player.card.hair,
        };
      }),
    },
    user2: {
      id: user2.id,
      players: user2.players.map((player) => {
        return {
          playerId: player.card.playerId,
          playerName: player.card.playerName,
          head: player.card.head,
          body: player.card.body,
          clothing: player.card.clothing,
          hair: player.card.hair,
        };
      }),
    },
    matchEvents: matchLogs,
  };

  //debug===========================================================================
  debugLogs.logs = resultLogs; //d
  debugLogs.score = goals[0] + "-" + goals[1]; //d
  debugLogs.user1.totalEvents = eventsArrs[0].join(" "); //d
  debugLogs.user2.totalEvents = eventsArrs[1].join(" "); //d

  function getLogsText_debug(user1, user2, debugLogs, matchLogs) {
    let logsText = "";

    logsText += "Звёзды игроков:\n=============================\n";

    logsText += "Игрок 1:\n=================\n";
    for (let i = 0; i < 11; i++) {
      logsText += `${debugLogs.user1.playersAsm[i].playerName}: ${debugLogs.user1.playersAsm[i].asmSum}\n`;
    }
    logsText += "=================\n";

    logsText += "Игрок 2:\n=================\n";
    for (let i = 0; i < 11; i++) {
      logsText += `${debugLogs.user2.playersAsm[i].playerName}: ${debugLogs.user2.playersAsm[i].asmSum}\n`;
    }
    logsText += "=================\n";

    logsText +=
      "\n\nРейтинг карточек перед матчем:\n=============================\n";

    logsText += "Игрок 1:\n=================\n";
    for (let i = 0; i < 11; i++) {
      logsText += `${user1.players[i].card.playerName}: 6.6\n`;
    }
    logsText += "=================\n";

    logsText += "Игрок 2:\n=================\n";
    for (let i = 0; i < 11; i++) {
      logsText += `${user2.players[i].card.playerName}: 6.6\n`;
    }
    logsText += "=================\n";

    logsText += "\n\nЛоги матча:\n=============================\n";
    for (let i = 1; i < matchLogs.length; i++) {
      let playersRatingString = "";

      for (let j = 0; j < matchLogs[i].players.length; j++) {
        playersRatingString += `${matchLogs[i].players[j].playerName} (${matchLogs[i].players[j].ratingDiff}), `;
      }

      playersRatingString = playersRatingString.substring(
        0,
        playersRatingString.length - 2
      );

      logsText += `${matchLogs[i].minute} минута, игрок ${
        matchLogs[i].user + 1
      }, событие ${matchLogs[i].momentType}.\nРезультат: ${
        matchLogs[i].result
      }.\nИзменение рейтинга: ${playersRatingString}.\n====================================\n`;
    }

    logsText += `\n\nСчёт: ${goals[0]}-${goals[1]}\n`;

    let yellowCards = [[], []],
      violations = [[], []],
      offendingPlayerIds = [[], []];
    for (let i = 1; i < matchLogs.length; i++) {
      let event = matchLogs[i];
      if (event.momentType === 11 && event.result.endsWith("card")) {
        let actedPlayer = event.players[0],
          injuredPlayer = event.players[1],
          cardType = "Yellow";

        if (offendingPlayerIds[event.user].includes(actedPlayer.playerId))
          cardType = "Red";
        else offendingPlayerIds[event.user].push(actedPlayer.playerId);

        violations[event.user].push({
          cardType,
          actedPlayer,
          injuredPlayer,
        });
        yellowCards[event.user].push({
          actedPlayer,
          injuredPlayer,
        });
      }
    }

    logsText += `\n\nНарушения:\n\n`;

    logsText += `Игрок 1:\n===============\n`;
    for (let i = 0; i < violations[0].length; i++) {
      logsText += `(${violations[0][i].cardType} card) Injured: ${yellowCards[0][i].injuredPlayer.playerName}, Acted: ${yellowCards[0][i].actedPlayer.playerName}`;

      if (violations[0][i].cardType === "Red") logsText += " (kicked)";

      logsText += "\n";
    }
    logsText += `===============\n`;

    logsText += `\nИгрок 2:\n===============\n`;
    for (let i = 0; i < violations[1].length; i++) {
      logsText += `(${violations[1][i].cardType} card) Injured: ${yellowCards[1][i].injuredPlayer.playerName}, Acted: ${yellowCards[1][i].actedPlayer.playerName}`;

      if (violations[1][i].cardType === "Red") logsText += " (kicked)";

      logsText += "\n";
    }
    logsText += `===============\n`;

    logsText +=
      "\n\nРейтинг карточек после матча:\n=============================\n";

    logsText += "Игрок 1:\n=================\n";
    for (let i = 0; i < 11; i++) {
      logsText += `${user1.players[i].card.playerName}: ${
        user1.players[i].card.seasonRatingMarks[
          user1.players[i].card.seasonRatingMarks.length - 1
        ]
      }\n`;
    }
    logsText += "=================\n";

    logsText += "Игрок 2:\n=================\n";
    for (let i = 0; i < 11; i++) {
      logsText += `${user2.players[i].card.playerName}: ${
        user2.players[i].card.seasonRatingMarks[
          user2.players[i].card.seasonRatingMarks.length - 1
        ]
      }\n`;
    }
    logsText += "=================\n";

    return logsText;
  }

  debugLogs.logsText = getLogsText_debug(user1, user2, debugLogs, matchLogs);
  //debug===========================================================================

  const matchResult = {
    debugLogs,
    dbQueries: [],
  };

  if (saveToDB) {
    matchResult.dbQueries = [
      prisma.user.update({
        where: {
          id: user1.id,
        },
        data: {
          lastTeam: JSON.stringify(user1.resultLastTeam),
        },
      }),
      prisma.user_players.update({
        where: {
          userId: user1.id,
        },
        data: {
          playersJson: JSON.stringify(user1.resultAllPlayers),
        },
      }),
      prisma.user.update({
        where: {
          id: user2.id,
        },
        data: {
          lastTeam: JSON.stringify(user2.resultLastTeam),
        },
      }),
      prisma.user_players.update({
        where: {
          userId: user2.id,
        },
        data: {
          playersJson: JSON.stringify(user2.resultAllPlayers),
        },
      }),
      prisma.weekend_match.update({
        where: {
          id: match.id,
        },
        data: {
          logs: JSON.stringify(resultLogs),
          score: goals[0] + ":" + goals[1],
        },
      }),
    ];
  }

  return matchResult;
}

async function createLeaguesNMatches() {
  await prisma.$transaction([
    prisma.weekend_match.deleteMany({}),
    prisma.weekend_league_players.deleteMany({}),
    prisma.weekend_league.deleteMany({}),
  ]);

  let servers = await prisma.game_server.findMany({
    select: {
      id: true,
      region: {
        select: {
          countries: {
            select: {
              leagues: {
                select: {
                  id: true,
                  server_id: true,
                  country_id: true,
                  leaguePlayers: {
                    select: {
                      playerId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let leaguesQueries = [],
    utcTimestamps = [3, 7, 11, 15, 19],
    nextTimestamp = new Date();

  nextTimestamp.setUTCHours(utcTimestamps[0], 0, 0, 0);

  for (let servIdx = 0; servIdx < servers.length; servIdx++) {
    for (
      let cntrIdx = 0;
      cntrIdx < servers[servIdx].region.countries.length;
      cntrIdx++
    ) {
      for (
        let lgIdx = 0;
        lgIdx < servers[servIdx].region.countries[cntrIdx].leagues.length;
        lgIdx++
      ) {
        let currLeague =
          servers[servIdx].region.countries[cntrIdx].leagues[lgIdx];

        // creation of first phase matches ==================================================
        let matchesData = [];
        for (
          let usIdx = 0;
          usIdx < currLeague.leaguePlayers.length / 2;
          usIdx++
        ) {
          matchesData.push({
            user1_id: currLeague.leaguePlayers[usIdx].playerId,
            user2_id:
              currLeague.leaguePlayers[
                currLeague.leaguePlayers.length - 1 - usIdx
              ].playerId,
            time: nextTimestamp,
          });
        }
        // creation of first phase matches ==================================================

        //заполнение лиг игроками =======================
        leaguesQueries.push(
          prisma.weekend_league.create({
            data: {
              isFull: false,
              server_id: currLeague.server_id,
              country_id: currLeague.country_id,
              level: 1,
              weekendLeaguePlayers: {
                create: currLeague.leaguePlayers,
              },
              weekendLeagueMatches: {
                create: matchesData,
              },
            },
          })
        );
      }
    }
  }

  await prisma.$transaction(leaguesQueries);
}

async function playMatchesPhase(phase) {
  console.log(
    `(weekend_leagues.js) Started playing weekend matches (phase ${phase})!`
  );

  const matches = await prisma.weekend_match.findMany({
      select: {
        id: true,
      },
      where: {
        league: {
          level: phase,
        },
      },
    }),
    matchesQueries = [];

  for (const match of matches) {
    let { dbQueries } = await playDebugMatch_v_17otr_v1_penalty(match.id, true);
    matchesQueries.push(...dbQueries);
  }

  await prisma.$transaction(matchesQueries);
}

async function calcMatchesPhase(phase) {
  console.log(
    `(weekend_leagues.js) Started calculating weekend matches results (phase ${phase})!`
  );

  let leagues = await prisma.weekend_league.findMany({
      select: {
        id: true,
        server_id: true,
        country_id: true,
        weekendLeagueMatches: {
          select: {
            id: true,
            user1_id: true,
            user2_id: true,
            score: true,
          },
        },
      },
      where: {
        level: phase,
      },
    }),
    leaguesQueries = [],
    matchesTime = new Date();

  matchesTime.setUTCHours(7, 0, 0, 0);

  for (const league of leagues) {
    let winnedUsers = [],
      matchesData = [];

    //getting winned users
    for (const currMatch of league.weekendLeagueMatches) {
      const goals = currMatch.score.split(":");

      if (goals[0] > goals[1])
        winnedUsers.push({
          playerId: currMatch.user1_id,
        });
      else
        winnedUsers.push({
          playerId: currMatch.user2_id,
        });
    }

    //getting matches data with winned users
    for (let usIdx = 0; usIdx < winnedUsers.length / 2; usIdx++)
      matchesData.push({
        user1_id: winnedUsers[usIdx].playerId,
        user2_id: winnedUsers[winnedUsers.length - 1 - usIdx].playerId,
        time: matchesTime,
      });

    leaguesQueries.push(
      prisma.weekend_league.create({
        data: {
          isFull: false,
          server_id: element.server_id,
          country_id: element.country_id,
          level: 2,
          weekendLeaguePlayers: {
            create: winnedUsers,
          },
          weekendLeagueMatches: {
            create: matchesData,
          },
        },
      })
    );
  }

  await prisma.$transaction(leaguesQueries);
}

async function createWeekendLeagues_v2(saturdayTimestamp) {
  await createLeaguesNMatches();

  const utcHourCheckpoints = [3, 7, 11, 15, 19];
  for (let phaseIdx = 0; phaseIdx < 10; phaseIdx++) {
    let nextTimestamp = new Date(
      Date.UTC(
        saturdayTimestamp.getUTCFullYear(),
        saturdayTimestamp.getUTCMonth(),
        saturdayTimestamp.getUTCDate() + (phaseIdx < 5 ? 0 : 1),
        utcHourCheckpoints[phaseIdx % 5]
      )
    );

    if (new Date() >= nextTimestamp) {
      await playMatchesPhase(phaseIdx + 1);
      await calcMatchesPhase(phaseIdx + 1);
    } else {
      let timeoutMs = nextTimestamp - new Date();
      setTimeout(async () => {
        await playMatchesPhase(phaseIdx + 1);
        await calcMatchesPhase(phaseIdx + 1);
      }, timeoutMs);
    }
  }
}

async function weekendLeaguesModule() {
  try {
    const now = new Date();
    let saturdayTimestamp;

    switch (now.getUTCDay()) {
      case 6:
        saturdayTimestamp = getUTCDateZeroTimestamp(now);
        break;

      case 0:
        saturdayTimestamp = getUTCDateZeroTimestamp(now, -1);
        break;

      default:
        saturdayTimestamp = getNextNeededWeekDayTimestamp(6);
        break;
    }

    if (now >= saturdayTimestamp) {
      createWeekendLeagues_v2(saturdayTimestamp);

      let nextSaturdayTimestamp = getNextNeededWeekDayTimestamp(6);
      setTimeout(() => {
        createWeekendLeagues_v2(nextSaturdayTimestamp);

        const sevenDaysMs = 1000 * 60 * 60 * 24 * 7;
        setInterval(() => {
          nextSaturdayTimestamp = new Date(nextSaturdayTimestamp + sevenDaysMs);
          createWeekendLeagues_v2(nextSaturdayTimestamp);
        }, sevenDaysMs);
      }, nextSaturdayTimestamp - now);
    } else {
      setTimeout(() => {
        createWeekendLeagues_v2(saturdayTimestamp);

        const sevenDaysMs = 1000 * 60 * 60 * 24 * 7;
        let nextSaturdayTimestamp = saturdayTimestamp;
        setInterval(() => {
          nextSaturdayTimestamp = new Date(nextSaturdayTimestamp + sevenDaysMs);
          createWeekendLeagues_v2(nextSaturdayTimestamp);
        }, sevenDaysMs);
      }, saturdayTimestamp - now);
    }

    setTimeout(async () => {
      setInterval(createWeekendLeagues_v2, 1000 * 60 * 60 * 24 * 7);

      await createWeekendLeagues_v2(saturdayTimestamp);
    }, saturdayTimestamp - now);
  } catch (e) {
    console.log("Error:", e);
  }
}

module.exports = {
  weekendLeaguesModule,
  createLeaguesNMatches,
};
