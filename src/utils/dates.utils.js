function getUTCDateZeroTimestamp(dateTime, daysDelta = 0) {
    return new Date(Date.UTC(dateTime.getUTCFullYear(), dateTime.getUTCMonth(), dateTime.getUTCDate() + daysDelta));
}

function getNextNeededWeekDayTimestamp(weekday) {
    if (weekday < 0 || weekday > 6) return null;

    const now = new Date();
    let daysDelta;
    if (weekday > now.getUTCDay()) {
        daysDelta = weekday - now.getUTCDay();
    }
    else if (weekday < now.getUTCDay()) {
        daysDelta = (6 - now.getUTCDay()) + weekday + 1;
    }
    else {
        daysDelta = 7;
    }

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysDelta));
}

module.exports = {
    getUTCDateZeroTimestamp,
    getNextNeededWeekDayTimestamp
};