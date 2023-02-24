function getUTCDateZeroTimestamp(dateTime, daysDelta = 0) {
  return new Date(
    Date.UTC(
      dateTime.getUTCFullYear(),
      dateTime.getUTCMonth(),
      dateTime.getUTCDate() + daysDelta
    )
  );
}

function getNextNeededWeekDayTimestamp(weekday) {
  if (weekday < 0 || weekday > 6) return null;

  const now = new Date();
  let daysDelta;
  if (weekday > now.getUTCDay()) {
    daysDelta = weekday - now.getUTCDay();
  } else if (weekday < now.getUTCDay()) {
    daysDelta = 6 - now.getUTCDay() + weekday + 1;
  } else {
    daysDelta = 7;
  }

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysDelta
    )
  );
}

function getSaturdayTimestamp(now) {
  const dayOfWeek = now.getUTCDay();

  if (dayOfWeek === 6) {
    return getUTCDateZeroTimestamp(now);
  } else if (dayOfWeek === 0) {
    return getUTCDateZeroTimestamp(now, -1);
  } else {
    return getNextNeededWeekDayTimestamp(6);
  }
}

function trainingAvilableTime(hours) {
  const now = new Date();
  
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      90,
      0
    )
  );
}

function trainingTime() {
  const now = new Date();
  
  return [new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      8,
      0,
      0
    )
  ), new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      16,
      0,
      0
    )
  ), new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    )
  )];
}

module.exports = {
  trainingTime,
  trainingAvilableTime,
  getSaturdayTimestamp,
  getUTCDateZeroTimestamp,
  getNextNeededWeekDayTimestamp,
};
