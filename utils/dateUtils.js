import { DateTime } from 'luxon';

export function convertUTCToLocal(utcDate) {
  console.log("convertUTCToLocal - Input UTC Date:", utcDate);
  const parsedDate = DateTime.fromISO(utcDate, { zone: 'utc' });
  const localDate = parsedDate.setZone(DateTime.local().zoneName);
  console.log("convertUTCToLocal - Converted Local Date:", localDate.toISO());
  return localDate.toLocaleString(DateTime.DATETIME_MED);
}

export function convertUTCToSpecifiedZone(utcDate, targetTimezone) {
  console.log("convertUTCToSpecifiedZone - Input UTC Date:", utcDate);
  console.log("convertUTCToSpecifiedZone - Target Timezone:", targetTimezone);

  try {
    const parsedDate = DateTime.fromISO(utcDate, { zone: 'utc' });
    const convertedDate = parsedDate.setZone(targetTimezone);

    console.log("convertUTCToSpecifiedZone - Converted Date:", convertedDate.toISO());
    return convertedDate.toLocaleString(DateTime.DATETIME_MED);
  } catch (error) {
    console.error("convertUTCToSpecifiedZone - Error:", error);
    return "Invalid Date/Timezone";
  }
}
