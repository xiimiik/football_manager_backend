const {setCardPosition, generateStartCardsSet} = require("../modules/players");
const MathService = require('../services/MathService');

class BotService {
    constructor() {
        this.botsNames = [
            {name: "Flankers", abbr: "Fln"},
            {name: "Speakers", abbr: "Spk"},
            {name: "Kickers", abbr: "Kck"},
            {name: "Dragons", abbr: "Drg"},
            {name: "Wolves", abbr: "Wlv"},
            {name: "Rats", abbr: "Rts"},
            {name: "Gingers", abbr: "Gng"},
            {name: "Strings", abbr: "Str"},
            {name: "Vices", abbr: "Vcs"},
            {name: "Strokes", abbr: "Stk"},
            {name: "Closers", abbr: "Cls"},
            {name: "Spies", abbr: "Sps"},
            {name: "Minis", abbr: "Mns"},
            {name: "Moses", abbr: "Mss"},
            {name: "Launders", abbr: "Lnd"},
            {name: "Visors", abbr: "VSR"},
        ];
        // this.botsIcons = ['Ball', 'Bear', 'Crown', 'Deer', 'Heraldic lion', 'Horse', 'Lighting', 'Lion', 'Spur', 'Tiger', 'Vector', 'Wolf'],
        this.botsIcons = ["bee", "cherry", "city", "cottager", "devil", "eagle", "forest", "fox", "gun", "hammer", "magpie", "pen", "reds", "seagull", "toffee", "villian"];
        this.botsColors = ["#090E19FF", "#135AE0FF", "#A01843FF", "#A5FF5BFF", "#EC242DFF", "#90CAFFFF", "#FAFCFFFF", "#FFDA25FF"];
        this.patternMinValue = 0;
        this.patternMaxValue = 11;
        this.iconsColorsMinValue = 0;
        this.iconsColorsMaxValue = 17;
        this.avatarMinValue = 1;
        this.avatarMaxValue = 5;
    }

    createLastTeam(cards) {
        //setting match lastTeam =====================================================
        let preferedCardPositions = {
                DEF: [],
                MID: [],
                ATT: [],
                GK: [],
            },
            botLastTeam = [];

        for (let plIdx = 0; plIdx < cards.length; plIdx++) preferedCardPositions[cards[plIdx].preferedPosition].push(cards[plIdx]);

        //FW
        if (preferedCardPositions.ATT.length) {
            let randPlIdx = MathService.randomInteger(0, preferedCardPositions.ATT.length - 1);

            botLastTeam.push(setCardPosition(preferedCardPositions.ATT[randPlIdx], 'FW:0'));
            preferedCardPositions.ATT.splice(randPlIdx, 1);
        }
        else {
            let randPlIdx = MathService.randomInteger(0, preferedCardPositions.MID.length + preferedCardPositions.DEF.length - 1);

            if (randPlIdx < preferedCardPositions.MID.length) {
                botLastTeam.push(setCardPosition(preferedCardPositions.MID[randPlIdx], 'FW:0'));
                preferedCardPositions.MID.splice(randPlIdx, 1);
            }
            else {
                botLastTeam.push(setCardPosition(preferedCardPositions.DEF[randPlIdx - preferedCardPositions.MID.length], 'FW:0'));
                preferedCardPositions.DEF.splice(randPlIdx - preferedCardPositions.MID.length, 1);
            }
        }

        //WG
        for (let i = 0; i < 2; i++) {
            if (preferedCardPositions.ATT.length) {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.ATT.length - 1);

                botLastTeam.push(setCardPosition(preferedCardPositions.ATT[randPlIdx], `WG:${i}`));
                preferedCardPositions.ATT.splice(randPlIdx, 1);
            }
            else {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.MID.length + preferedCardPositions.DEF.length - 1);

                if (randPlIdx < preferedCardPositions.MID.length) {
                    botLastTeam.push(setCardPosition(preferedCardPositions.MID[randPlIdx], `WG:${i}`));
                    preferedCardPositions.MID.splice(randPlIdx, 1);
                }
                else {
                    botLastTeam.push(setCardPosition(preferedCardPositions.DEF[randPlIdx - preferedCardPositions.MID.length], `WG:${i}`));
                    preferedCardPositions.DEF.splice(randPlIdx - preferedCardPositions.MID.length, 1);
                }
            }
        }

        //CM
        for (let i = 0; i < 3; i++) {
            if (preferedCardPositions.MID.length) {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.MID.length - 1);

                botLastTeam.push(setCardPosition(preferedCardPositions.MID[randPlIdx], `CM:${i}`));
                preferedCardPositions.MID.splice(randPlIdx, 1);
            }
            else {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.ATT.length + preferedCardPositions.DEF.length - 1);

                if (randPlIdx < preferedCardPositions.ATT.length) {
                    botLastTeam.push(setCardPosition(preferedCardPositions.ATT[randPlIdx], `CM:${i}`));
                    preferedCardPositions.ATT.splice(randPlIdx, 1);
                }
                else {
                    botLastTeam.push(setCardPosition(preferedCardPositions.DEF[randPlIdx - preferedCardPositions.ATT.length], `CM:${i}`));
                    preferedCardPositions.DEF.splice(randPlIdx - preferedCardPositions.ATT.length, 1);
                }
            }
        }

        //CD
        for (let i = 0; i < 2; i++) {
            if (preferedCardPositions.DEF.length) {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.DEF.length - 1);

                botLastTeam.push(setCardPosition(preferedCardPositions.DEF[randPlIdx], `CD:${i}`));
                preferedCardPositions.DEF.splice(randPlIdx, 1);
            }
            else {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.ATT.length + preferedCardPositions.MID.length - 1);

                if (randPlIdx < preferedCardPositions.ATT.length) {
                    botLastTeam.push(setCardPosition(preferedCardPositions.ATT[randPlIdx], `CD:${i}`));
                    preferedCardPositions.ATT.splice(randPlIdx, 1);
                }
                else {
                    botLastTeam.push(setCardPosition(preferedCardPositions.MID[randPlIdx - preferedCardPositions.ATT.length], `CD:${i}`));
                    preferedCardPositions.MID.splice(randPlIdx - preferedCardPositions.ATT.length, 1);
                }
            }
        }

        //WB
        for (let i = 0; i < 2; i++) {
            if (preferedCardPositions.DEF.length) {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.DEF.length - 1);

                botLastTeam.push(setCardPosition(preferedCardPositions.DEF[randPlIdx], `WB:${i}`));
                preferedCardPositions.DEF.splice(randPlIdx, 1);
            }
            else {
                let randPlIdx = MathService.randomInteger(0, preferedCardPositions.ATT.length + preferedCardPositions.MID.length - 1);

                if (randPlIdx < preferedCardPositions.ATT.length) {
                    botLastTeam.push(setCardPosition(preferedCardPositions.ATT[randPlIdx], `WB:${i}`));
                    preferedCardPositions.ATT.splice(randPlIdx, 1);
                }
                else {
                    botLastTeam.push(setCardPosition(preferedCardPositions.MID[randPlIdx - preferedCardPositions.ATT.length], `WB:${i}`));
                    preferedCardPositions.MID.splice(randPlIdx - preferedCardPositions.ATT.length, 1);
                }
            }
        }

        //GK
        botLastTeam.push(setCardPosition(preferedCardPositions.GK[0], 'GK:0'));
        preferedCardPositions.GK.splice(0, 1);

        return botLastTeam;
        //setting match lastTeam =====================================================
    }

    generateBot(fullName, logo, leagueLevel) {
        let avatarId = 1, botPlayers, botLastTeam;

        botPlayers = generateStartCardsSet(avatarId, leagueLevel);
        botLastTeam = this.createLastTeam(botPlayers);

        let botName, botAbbr, botLogo;

        if (fullName) {
            botName = fullName.name;
            botAbbr = fullName.abbr;
        }
        else {
            let botFullName = botsNames[MathService.randomInteger(0, botsNames.length - 1)];
            botName = botFullName.name;
            botAbbr = botFullName.abbr;
        }

        if (logo) botLogo = logo;
        else {
            let shapeColorIdx = MathService.randomInteger(0, botsColors.length - 1),
                iconColorIdx = MathService.randomIntegerExcluding(0, botsColors.length - 1, [shapeColorIdx]),
                outlineColorIdx = MathService.randomIntegerExcluding(0, botsColors.length - 1, [shapeColorIdx, iconColorIdx]);

            botLogo =
                `{"shapeColor":"${botsColors[shapeColorIdx]}",` +
                `"iconColor":"${botsColors[iconColorIdx]}",` +
                `"outlineColor":"${botsColors[outlineColorIdx]}",` +
                `"iconName":"${botsIcons[MathService.randomInteger(0, botsIcons.length - 1)]}"}`;
        }


        let bot = {
            name: botName,
            abbr: botAbbr,
            logo: botLogo,
            avatar: avatarId,
            isBot: true,
            lastTactic: `{"teamFocus":"wing-play","attack":"quantity","defense":"fierce"}`,
            lastTeam: JSON.stringify(botLastTeam),
            playersJson: JSON.stringify(botPlayers),
        };

        return bot;
    }
}

module.exports = new BotService();