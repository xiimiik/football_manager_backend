class MathService {
    randomInteger(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }

    randomIntegerExcluding(min, max, excludedValues) {
        let randomValue = Math.round(min - 0.5 + Math.random() * (max - min + 1));

        while(excludedValues.includes(randomValue)) randomValue = Math.round(min - 0.5 + Math.random() * (max - min + 1));

        return randomValue;
    }

    randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }
}

module.exports = new MathService();