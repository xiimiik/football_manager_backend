const fs = require("fs");
const csv = require('@fast-csv/parse');
const MathService = require('../services/MathService');


let maleNames = [];

fs.createReadStream('./src/data/babynames-clean.csv')
    .pipe(csv.parse())
    .on('error', error => console.error("Error in (players.js):", error))
    .on('data', row => {
        if (row[1] === "boy") maleNames.push(row[0]);
    })
    .on('end', () => {
        console.log("(modules/players.js) Loaded male names!");
    });

function generateCard(id, isGoalKeeper, avatarId, predefinedSkills, leagueLevel) {
  const avatarLook = {
    base: ["dark skin 1 black", "dark skin 1 blue", "dark skin 1 claret", "dark skin 1 green", "dark skin 1 red", "dark skin 1 sky", "dark skin 1 white", "dark skin 1 yellow", "dark skin 2 black", "dark skin 2 blue", "dark skin 2 claret", "dark skin 2 green", "dark skin 2 red", "dark skin 2 sky", "dark skin 2 white", "dark skin 2 yellow", "dark skin 3 black", "dark skin 3 blue", "dark skin 3 claret", "dark skin 3 green", "dark skin 3 red", "dark skin 3 sky", "dark skin 3 white", "dark skin 3 yellow", "light skin 1 black", "light skin 1 blue", "light skin 1 claret", "light skin 1 green", "light skin 1 red", "light skin 1 sky", "light skin 1 white", "light skin 1 yellow", "light skin 2 black", "light skin 2 blue", "light skin 2 claret", "light skin 2 green", "light skin 2 red", "light skin 2 sky", "light skin 2 white", "light skin 2 yellow", "light skin 3 black", "light skin 3 blue", "light skin 3 claret", "light skin 3 green", "light skin 3 red", "light skin 3 sky", "light skin 3 white", "light skin 3 yellow", "tanned skin 1 black", "tanned skin 1 blue", "tanned skin 1 claret", "tanned skin 1 green", "tanned skin 1 red", "tanned skin 1 sky", "tanned skin 1 white", "tanned skin 1 yellow", "tanned skin 2 black", "tanned skin 2 blue", "tanned skin 2 claret", "tanned skin 2 green", "tanned skin 2 red", "tanned skin 2 sky", "tanned skin 2 white", "tanned skin 2 yellow", "tanned skin 3 black", "tanned skin 3 blue", "tanned skin 3 claret", "tanned skin 3 green", "tanned skin 3 red", "tanned skin 3 sky", "tanned skin 3 white", "tanned skin 3 yellow"],
    hair: ["blond 1", "blond 2", "blond 3", "blond 4", "blond 5", "blond 6", "brown 1", "brown 2", "brown 3", "brown 4", "brown 5", "brown 6", "brunette 1", "brunette 2", "brunette 3", "brunette 4", "brunette 5", "brunette 6", "red 1", "red 2", "red 3", "red 4", "red 5", "red 6"],
    eyes: ["1 blue", "1 brown", "1 green", "2 blue", "2 brown", "2 green", "3 blue", "3 brown", "3 green"],
    mouth: ["angry 1", "angry 2", "neutral", "smile 1", "smile 2"],
    noses: ["1", "2"],
    brows: ["1 angry blond", "1 angry brown", "1 angry brunette", "1 angry red", "1 happy blonde", "1 happy brown", "1 happy brunette", "1 happy red", "1 neutral blonde", "1 neutral brown", "1 neutral brunette", "1 neutral red", "2 angry blond", "2 angry brown", "2 angry brunette", "2 angry red", "2 happy blonde", "2 happy brown", "2 happy bunette", "2 happy red", "2 neutral blond", "2 neutral brown", "2 neutral brunette", "2 neutral red"]
  };

  function generateAvatar(card) {
    const avatar = [];

    for (const key in avatarLook) {
      const item = avatarLook[key];
      avatar.push(item[MathService.randomInteger(0, item.length - 1)]);
    }

    card.avatar = avatar.join(':');
  }

    function generateSkills(card, isGoalKeeper, avatarId, predefinedSkills) {
        let pot = MathService.randomInteger(-1, 1), currAbi = MathService.randomInteger(-1, 1);

        if (predefinedSkills) {
            if (predefinedSkills.currentAbility) currAbi = predefinedSkills.currentAbility;
            if (predefinedSkills.potential) pot = predefinedSkills.potential;
        }

        card.currentAbility = currAbi;
        card.psychoSkills = {
            ambitious: -1,
            loyalty: -1,
            potential: pot,
            workRate: -1,
            creativity: -1,
        };

        if (Math.random() < 0.5) card.psychoSkills.loyalty = 1; //loy=-1, a amb=[-1;1]
        else card.psychoSkills.ambitious = 1; //amb=-1, a loy=[-1;1]

        if (Math.random() < 0.5) card.psychoSkills.creativity = 1; //cr=-1, a wr=[-1;1]
        else card.psychoSkills.workRate = 1; //wr=-1, a cr=[-1;1]


        card.physicalSkills = {
            agility: 0,
            pace: 0,
            stamina: 0,
            strength: 0,
            jump: 0,
        };

        if (isGoalKeeper) card.technicalSkills = {
                positioning: 0,
                reaction: 0,
                concentration: 0,
                vision: 0,
                legs: 0,
            };
        else card.technicalSkills = {
                tackling: 0,
                shoot: 0,
                technique: 0,
                pass: 0,
                cross: 0,
            };


        //скиллы в зависимости от currAbi================================================
        let redSkillsCount, greenSkillsCount, redSkillsIdx = [], greenSkillsIdx = [];

        switch (currAbi) {
            case -1:
                greenSkillsCount = 1;
                redSkillsCount = 1;
                break;

            case 0:
                greenSkillsCount = 2;
                redSkillsCount = 1;
                break;

            case 1:
                greenSkillsCount = 3;
                redSkillsCount = 1;
                break;
        }

        for (let i = 0; i < greenSkillsCount; i++) {
            let skillIdx = MathService.randomIntegerExcluding(0, 9, greenSkillsIdx);
            greenSkillsIdx.push(skillIdx);

            switch (skillIdx) {
                case 0:
                    if (isGoalKeeper) card.technicalSkills.positioning = 1;
                    else card.technicalSkills.tackling = 1;
                    break;

                case 1:
                    if (isGoalKeeper) card.technicalSkills.reaction = 1;
                    else card.technicalSkills.shoot = 1;
                    break;

                case 2:
                    if (isGoalKeeper) card.technicalSkills.concentration = 1;
                    else card.technicalSkills.technique = 1;
                    break;

                case 3:
                    if (isGoalKeeper) card.technicalSkills.vision = 1;
                    else card.technicalSkills.pass = 1;
                    break;

                case 4:
                    if (isGoalKeeper) card.technicalSkills.legs = 1;
                    else card.technicalSkills.cross = 1;
                    break;

                case 5:
                    card.physicalSkills.agility = 1;
                    break;

                case 6:
                    card.physicalSkills.pace = 1;
                    break;

                case 7:
                    card.physicalSkills.stamina = 1;
                    break;

                case 8:
                    card.physicalSkills.strength = 1;
                    break;

                case 9:
                    card.physicalSkills.jump = 1;
                    break;
            }
        }

        for (let i = 0; i < redSkillsCount; i++) {
            let skillIdx = MathService.randomIntegerExcluding(0, 9, [...greenSkillsIdx, ...redSkillsIdx]);
            redSkillsIdx.push(skillIdx);

            switch (skillIdx) {
                case 0:
                    if (isGoalKeeper) card.technicalSkills.positioning = -1;
                    else card.technicalSkills.tackling = -1;
                    break;

                case 1:
                    if (isGoalKeeper) card.technicalSkills.reaction = -1;
                    else card.technicalSkills.shoot = -1;
                    break;

                case 2:
                    if (isGoalKeeper) card.technicalSkills.concentration = -1;
                    else card.technicalSkills.technique = -1;
                    break;

                case 3:
                    if (isGoalKeeper) card.technicalSkills.vision = -1;
                    else card.technicalSkills.pass = -1;
                    break;

                case 4:
                    if (isGoalKeeper) card.technicalSkills.legs = -1;
                    else card.technicalSkills.cross = -1;
                    break;

                case 5:
                    card.physicalSkills.agility = -1;
                    break;

                case 6:
                    card.physicalSkills.pace = -1;
                    break;

                case 7:
                    card.physicalSkills.stamina = -1;
                    break;

                case 8:
                    card.physicalSkills.strength = -1;
                    break;

                case 9:
                    card.physicalSkills.jump = -1;
                    break;
            }
        }
        //скиллы в зависимости от currAbi================================================


        // card.openSkills = [];
        //
        // let value = MathService.randomInteger(1, 10);
        //
        // if ([1,3,4].includes(avatarId)) {
        //     if (value <= 4) card.psychoSkills.potential = -1;
        //     else if (value <= 8) card.psychoSkills.potential = 0;
        //     else card.psychoSkills.potential = 1;
        // } else {
        //     if (value <= 2) card.psychoSkills.potential = -1;
        //     else if (value <= 6) card.psychoSkills.potential = 0;
        //     else card.psychoSkills.potential = 1;
        // }
        //в зависимости от POT выбираем STA и TECH
        // if (!isGoalKeeper) {
        //     if (card.psychoSkills.potential === -1) {
        //         card.technicalSkills.technique = -1;
        //         card.physicalSkills.stamina = -1;
        //     } else if (card.psychoSkills.potential === 0) {
        //         card.technicalSkills.technique = Math.min(card.technicalSkills.technique, 0);
        //         card.physicalSkills.stamina = Math.min(card.physicalSkills.stamina, 0);
        //     }
        // }
    }

    function generateAge(card) {
        let letters = ['C', 'B', 'A'],
            level = letters[card.psychoSkills.potential + 1] + letters[card.currentAbility + 1];

        switch (level) {
            case 'CC':
                card.age = MathService.randomInteger(19, 29);
                break;

            case 'CB':
                card.age = MathService.randomInteger(25, 29);
                break;

            case 'CA':
                card.age = MathService.randomInteger(25, 29);
                break;

            case 'BC':
                card.age = MathService.randomInteger(23, 29);
                break;

            case 'BB':
                card.age = MathService.randomInteger(25, 29);
                break;

            case 'BA':
                card.age = MathService.randomInteger(25, 27);
                break;

            case 'AC':
                card.age = MathService.randomInteger(19, 21);
                break;

            case 'AB':
                card.age = MathService.randomInteger(21, 23);
                break;

            case 'AA':
                card.age = MathService.randomInteger(23, 25);
                break;
        }
    }

    function generateSalary(card) {
        let level = card.psychoSkills.potential + card.currentAbility;

        switch (level) {
            case -2:
                if (card.psychoSkills.ambitious === 1) card.salary = Math.floor(MathService.randomFloat(9, 12) * 1000);
                else card.salary = Math.floor(MathService.randomFloat(6, 12) * 1000);
                break;

            case -1:
                if (card.psychoSkills.ambitious === 1) card.salary = Math.floor(MathService.randomFloat(12, 16) * 1000);
                else card.salary = Math.floor(MathService.randomFloat(8, 16) * 1000);
                break;

            case 0:
                if (card.psychoSkills.ambitious === 1) card.salary = Math.floor(MathService.randomFloat(15, 20) * 1000);
                else card.salary = Math.floor(MathService.randomFloat(10, 20) * 1000);
                break;

            case 1:
                if (card.psychoSkills.ambitious === 1) card.salary = Math.floor(MathService.randomFloat(22, 30) * 1000);
                else card.salary = Math.floor(MathService.randomFloat(15, 30) * 1000);
                break;

            case 2:
                if (card.psychoSkills.ambitious === 1) card.salary = Math.floor(MathService.randomFloat(35, 50) * 1000);
                else card.salary = Math.floor(MathService.randomFloat(20, 50) * 1000);
                break;
        }

        card.salary = card.salary - (card.salary % 100);
    }


    let card = {};

    card.playerId = id;
    card.playerName = maleNames[MathService.randomInteger(0, maleNames.length - 1)];
    card.isGoalKeeper = isGoalKeeper;

    card.mood = MathService.randomInteger(-3, 3);
    card.moodIsOpen = false;

    card.seasonRatingMarks = [];
    card.averageRating = 0;
    card.playerReputation = leagueLevel;

    card.seasonYellowCardsCount = 0;
    card.unavailableMatchesCount = 0;

    let preferedPositions = ['GK', 'DEF', 'MID', 'ATT'];
    if (isGoalKeeper) card.preferedPosition = preferedPositions[0];
    else card.preferedPosition = preferedPositions[MathService.randomInteger(1, 3)];

    generateSkills(card, isGoalKeeper, avatarId, predefinedSkills);
    generateAge(card);
    generateSalary(card);
    generateAvatar(card);

    return card;
}

function setCardPosition(card, position) {
    return Object.assign({position: position}, card);
}

function generateStartCardsSet(avatarId, leagueLevel) {
    let cards = [],
        playerId = 1;
    
    switch (leagueLevel) {
        case 1:
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            }
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 2:
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            }
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 3:
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
            }
            for (let i = 0; i < 4; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
            }
            cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 4:
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
            }
            for (let i = 0; i < 4; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
            }
            cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 5:
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
            }
            for (let i = 0; i < 4; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
            }
            cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 6:
            for (let i = 0; i < 5; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
            }
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
            }

            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 7:
            for (let i = 0; i < 5; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
            }
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
            }

            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;

        case 8:
            for (let i = 0; i < 5; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: -1}, leagueLevel));
            }
            for (let i = 0; i < 2; i++) {
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: -1, currentAbility: 1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: -1}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 0}, leagueLevel));
                cards.push(generateCard(playerId++, false, avatarId, {potential: 0, currentAbility: 1}, leagueLevel));
            }

            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: -1}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 0}, leagueLevel));
            cards.push(generateCard(playerId++, false, avatarId, {potential: 1, currentAbility: 1}, leagueLevel));
            cards.push(generateCard(playerId, true, avatarId, null, leagueLevel));
            break;
    }

    return cards;
}


module.exports = {
    generateCard,
    setCardPosition,
    generateStartCardsSet,
};