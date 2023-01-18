const fs = require("fs");
const csv = require('@fast-csv/parse');
const MathService = require('../services/MathService');


let maleNames = [];

fs.createReadStream('./data/babynames-clean.csv')
    .pipe(csv.parse())
    .on('error', error => console.error("Error in (players.js):", error))
    .on('data', row => {
        if (row[1] === "boy") maleNames.push(row[0]);
    })
    .on('end', () => {
        console.log("(modules/players.js) Loaded male names!");
    });

function generateCard(id, isGoalKeeper, avatarId, predefinedSkills, leagueLevel) {
    const pathToSprites = "CardAvatars",
        heads = ['Face_1', 'Face_2', 'Face_3'],
        bodies = ['Body_1', 'Body_2', 'Body_3'],
        clothes = ['Kit_1', 'Kit_2', 'Kit_3', 'Kit_4', 'Kit_5', 'Kit_6', 'Kit_7', 'Kit_8', 'Kit_9', 'Kit_10', 'Kit_11', 'Kit_12', 'Kit_13', 'Kit_14', 'Kit_15', 'Kit_16', 'Kit_17'],
        haircuts = ['Hair_1', 'Hair_2', 'Hair_3', 'Hair_4', 'Hair_5', 'Hair_6', 'Hair_7', 'Hair_8', 'Hair_9', 'Hair_10', 'Hair_11', 'Hair_12', 'Hair_13', 'Hair_14'];

    function generateAvatar(card) {
        card.head = pathToSprites + "/Faces/" + heads[MathService.randomInteger(0, heads.length - 1)];
        card.body = pathToSprites + "/Bodies/" + bodies[MathService.randomInteger(0, bodies.length - 1)];
        card.clothing = pathToSprites + "/Kits/" + clothes[MathService.randomInteger(0, clothes.length - 1)];
        card.hair = pathToSprites + "/Hairs/" + haircuts[MathService.randomInteger(0, haircuts.length - 1)];
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