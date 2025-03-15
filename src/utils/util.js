import {
  isValidPhoneNumber,
  validatePhoneNumberLength,
} from "libphonenumber-js";
import Timezones from './../constants/zone';
import moment from 'moment-timezone';
import axios from "axios";


const daysMap = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
export function transformPayloadSingle(timeZone, dayOrDate, times) {
  // Map common timezone names to IANA timezone names
  const timezoneMap = {
    "Eastern Standard Time": "America/New_York",
    "Central Standard Time": "America/Chicago",
    "Mountain Standard Time": "America/Denver",
    "US Mountain Standard Time": "America/Phoenix",
    "Pacific Standard Time": "America/Los_Angeles",
    "Alaskan Standard Time": "America/Anchorage",
    "Hawaiian Standard Time": "Pacific/Honolulu"
  };

  // Get the mapped timezone or use the given one
  const timeZone1 = timezoneMap[timeZone] || timeZone;
  console.log("Given Timezone:", timeZone, "Mapped Timezone:", timeZone1);

  if (!moment.tz.zone(timeZone1)) {
    console.error("Invalid Timezone:", timeZone1);
    return { error: "Invalid timezone provided" };
  }

  let targetMoment;

  // Get the current date-time **IN THE SELECTED TIMEZONE** (not system time)
  const currentMoment = moment().tz(timeZone1);
  console.log("Current Time in Selected Timezone:", currentMoment.format());

  // Check if the input is a weekday name (e.g., "Saturday") or a full date
  if (moment.weekdays().includes(dayOrDate)) {
    // Convert day name (e.g., "Sunday") to a weekday index
    const targetDayIndex = moment().day(dayOrDate).day();

    // Set target date in selected timezone
    targetMoment = currentMoment.clone().day(targetDayIndex);

    // Get the input time in hours and minutes
    const inputTime = moment(times, "h:mm A");

    // Set the time in the target moment (to be 10:00 AM in that timezone)
    targetMoment.set({
      hour: inputTime.hours(),
      minute: inputTime.minutes(),
      second: 0,
      millisecond: 0
    });

    console.log("Target Date Before Adjustment:", targetMoment.format());

    // If today is the selected day, but the time has already passed **IN THAT TIMEZONE**, move to next week
    if (targetMoment.isSame(currentMoment, "day") && targetMoment.isBefore(currentMoment)) {
      targetMoment.add(7, "days");
    }

    // If the target day is **before** the current date (e.g., today is Saturday, but input is Friday), move to next week
    if (targetMoment.isBefore(currentMoment, "day")) {
      targetMoment.add(7, "days");
    }
  } else {
    // Assume input is a full date (e.g., "Sat Mar 15 2025") and parse it in the given timezone
    targetMoment = moment.tz(dayOrDate, "ddd MMM DD YYYY", timeZone1);

    // If a time is provided, set the time correctly
    if (times) {
      const inputTime = moment(times, "h:mm A");
      targetMoment.set({
        hour: inputTime.hours(),
        minute: inputTime.minutes(),
        second: 0,
        millisecond: 0
      });
    }
  }

  console.log("Final Computed DateTime:", targetMoment.format());

  // Construct the transformed payload
  return {
    date: targetMoment.toISOString(),
    timeOfDay: targetMoment.format("HH:mm:ss"),
    isEnabled: true
  };
}

export function transformPayloadDouble(timeZone, days, times) {
  console.log(timeZone, days, times)
  // Validate the timezone input
  if (!moment.tz.zone(timeZone)) {
    throw new Error("Invalid timezone input. Please provide a valid IANA timezone.");
  }

  // Function to map day names to ISO weekday numbers
  const dayNameToIsoWeekday = (dayName) => {
    const daysMap = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    };
    return daysMap[dayName];
  };

  // Normalize days input
  let targetDays = [];

  // Handle specific ranges and common patterns
  if (days === "Saturday & Sunday") {
    targetDays = [6, 0];
  } else if (days === "All 7 days of the week") {
    targetDays = [0, 1, 2, 3, 4, 5, 6];
  } else if (days.includes("to")) {
    // Handle ranges like "Monday to Thursday" or "Saturday to Monday"
    const [startDay, endDay] = days.split(" to ").map(day => dayNameToIsoWeekday(day.trim()));

    if (startDay <= endDay) {
      // Normal case: Loop forward (e.g., Monday to Friday)
      for (let i = startDay; i <= endDay; i++) {
        targetDays.push(i);
      }
    } else {
      // Wrap-around case: Loop to Saturday (6), then from Sunday (0) to endDay
      for (let i = startDay; i <= 6; i++) {
        targetDays.push(i);
      }
      for (let i = 0; i <= endDay; i++) {
        targetDays.push(i);
      }
    }
  }
  else if (days.includes(",")) {
    // Handle lists like "Monday, Wednesday, Friday"
    targetDays = days.split(",").map(day => dayNameToIsoWeekday(day.trim()));
  } else {
    // Handle a single day input like "Monday"
    targetDays = [dayNameToIsoWeekday(days)];
  }

  if (targetDays.length === 0) {
    throw new Error("Invalid days input.");
  }

  // Parse the given time
  const inputTime = moment(times, "h:mm A");
  if (!inputTime.isValid()) {
    throw new Error("Invalid time format.");
  }

  // Calculate the startDate (next occurrence of the first day in the range)
  const currentDate = moment().tz(timeZone);
  let startDate = null;
  let endDate = null;

  // for (let offset = 0; offset < 7; offset++) {
  //   const potentialDate = currentDate.clone().add(offset, "days");
  //   if (targetDays.includes(potentialDate.isoWeekday())) {
  //     if (!startDate) {
  //       startDate = moment.tz(
  //           `${potentialDate.format("YYYY-MM-DD")} ${inputTime.format("HH:mm")}`,
  //           "YYYY-MM-DD HH:mm",
  //           timeZone
  //       );
  //     }
  //     if (potentialDate.isoWeekday() === targetDays[targetDays.length - 1]) {
  //       endDate = moment.tz(
  //           `${potentialDate.format("YYYY-MM-DD")} ${inputTime.format("HH:mm")}`,
  //           "YYYY-MM-DD HH:mm",
  //           timeZone
  //       );
  //       break;
  //     }
  //   }
  // }
  //
  // if (!startDate || !endDate) {
  //   throw new Error("Could not determine startDate or endDate.");
  // }

  // Construct the transformed payload
  return {
    //date: startDate.toISOString(),
    timeOfDay: moment(times, "h:mm A").format("HH:mm"),
    startDate: null, //startDate.toISOString()
    endDate: null, //endDate.toISOString()
    daysOfWeek: targetDays,
    //isEnabled: true,
    recipientRoles: 4
  };
}
export const parseDaysInput = (input) => {
  const normalizedInput = input.trim().toLowerCase();


  switch (normalizedInput) {
    case "monday":
    case "monday,":
    case "m":
    case "m,":
    case "mon":
    case "mon,":
      return "Monday";
    case "tuesday":
    case "tuesday,":
    case "t":
    case "t,":
    case "tue":
    case "tue,":
    case "tues":
    case "tues,":
      return "Tuesday";
    case "wednesday":
    case "wednesday,":
    case "w":
    case "w,":
    case "we":
    case "we,":
    case "wed":
    case "wed,":
      return "Wednesday";
    case "thursday":
    case "thursday,":
    case "th":
    case "th,":
    case "thu":
    case "thu,":
    case "thur":
    case "thur,":
      return "Thursday";
    case "friday":
    case "friday,":
    case "f":
    case "f,":
    case "fr":
    case "fr,":
    case "fri":
    case "fri,":
      return "Friday";
    case "saturday":
    case "saturday,":
    case "sat":
    case "sat,":
    case "sa":
    case "sa,":
      return "Saturday";
    case "sunday":
    case "sunday,":
    case "s":
    case "s,":
    case "su":
    case "su,":
    case "sun":
    case "sun,":
      return "Sunday";
    case "everyday":
    case "everyday,":
      return "All 7 days of the week";
    case "week":
    case "week,":
      return "All 7 days of the week";
    case "weekdays":
    case "weekdays,":
      return "Monday to Friday";
    case "weekends":
    case "weekends,":
      return "Saturday & Sunday";
    case "today":
    case "today,":
      return new Date().toDateString(); // Returns the current date as a string

    default:
      if (/^((mon|tue|wed|thu|fri|sat|sun),)*(mon|tue|wed|thu|fri|sat|sun)$/i.test(normalizedInput)) {
        return normalizedInput
          .split(",")
          .map((day) => daysMap[day.trim().toLowerCase()])
          .join(", ");
      }

      // Handle day ranges like mon-tue, tue-wed, etc., and their reverse forms
      if (/^(mon|tue|wed|thu|fri|sat|sun)-(mon|tue|wed|thu|fri|sat|sun)$/i.test(normalizedInput)) {


        const [start, end] = normalizedInput
            .split("-")
            .map((day) => daysMap[day.toLowerCase()]);

        if (start && end) {
          return `${start} to ${end}`;
        }
      }

      // Handle reverse day ranges like tue-mon
      if (/^(mon|tue|wed|thu|fri|sat|sun)-(mon|tue|wed|thu|fri|sat|sun)$/i.test(normalizedInput.split("-").reverse().join("-"))) {


        const [start, end] = normalizedInput
            .split("-")
            .reverse()
            .map((day) => daysMap[day.toLowerCase()]);

        if (start && end) {
          return `${start} to ${end}`;
        }
      }

      return ""; // Handle unrecognized input
  }
};


export const parseTimeInput = (input) => {
  // Normalize input by trimming spaces and converting to lowercase
  const normalizedInput = input.trim().toLowerCase();

  // Handle "now"
  if (normalizedInput === "now") {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return { msg: "", value: formatTo12Hour(hours, minutes+1) };
  }

  // Match patterns like "8am", "8:00 am", "08:00 AM", "8:3"
  const timeRegex = /^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i; // Allow single-digit minutes
  const match = timeRegex.exec(normalizedInput);

  if (match) {
    let [_, hours, minutes = "0", period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    // Handle invalid hour or minute range
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return { msg: "Invalid time format", value: input };
    }

    if (period) {
      // Handle 12-hour format input
      period = period.toLowerCase();
      if (period === "pm" && hours !== 12) hours += 12;
      if (period === "am" && hours === 12) hours = 0;
    }

    return { msg: "", value: formatTo12Hour(hours, minutes) };
  }

  return { msg: "Invalid time input", value: input };
};

// Helper function to format time to 12-hour format
function formatTo12Hour(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}


// Function to validate phone numbers
export const validatePhoneNumber = (phoneNumber) => {
  const number =
    phoneNumber?.slice(0, 1) +
      " " +
      "(" +
      phoneNumber?.slice(1, 4) +
      ")" +
      " " +
      phoneNumber?.slice(4, 7) +
      "-" +
      phoneNumber?.slice(7, 11) || null;

  const phone = isValidPhoneNumber(number, "US");
  const length = validatePhoneNumberLength(number, "US");

  if (length === "TOO_SHORT") {
    return { valid: false, message: "Phone number too short" };
  }

  if (length === "TOO_LONG") {
    return { valid: false, message: "Phone number too long" };
  }

  if (number === null || !phone) {
    return { valid: false, message: "Invalid phone number format." };
  }

  if (number?.split(" ")[0] !== "1") {
    return {
      valid: false,
      message: "Phone number must be from the USA or Canada.",
    };
  }
};

export const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Please enter your name.";
        break;
        case "friendName":
          if (!value.trim()) error = "Please enter their name.";
          break;
      case "email":
        if (!value.trim()) error = "Please provide your email address.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Please enter a valid email address.";
        break;
      case "phone":
        if (!value.trim()) error = "Please provide your phone number.";
        // } else {
        //   const data = validatePhoneNumber(value);
        //   if (data && data.message) {
        //     error = data.message;
        //   }
        // }
        break;
        case "friendMobile":
          if (!value.trim()) error = "Please provide their phone number.";
          // } else {
          //   const data = validatePhoneNumber(value);
          //   if (data && data.message) {
          //     error = data.message;
          //   }
          // }
          break;
      case "msg":
        if (!value.trim()) error = "Please enter your message.";
        break;
      case "days":
        if (!value.trim()) error = "Please select the number of days.";
        break;
      case "time":
        if (!value.trim()) error = "Please provide a time.";
        else {
          const data = parseTimeInput(value);
          if (
            data?.msg === "Invalid time format" ||
            data?.msg === "Invalid time input"
          ) {
            error = data?.msg;
          }
        }
        break;
      case "timezone":
        if (!value.trim()) error = "Please select a time zone.";
        break;

      default:
        break;
    }

    return error;
  };


export const signupUser = async (newToken,name,phone, setNewId  ) => {

  try {
    const response = await axios.post(
        "https://ra-user-staging.azurewebsites.net/v1/signup",
        {
          elder: {
            name: name,
            timeZone: "Eastern Standard Time",
            phoneNumber: phone,
          },
          champion: {
            phoneNumber: '',
          },
        },
        {
          headers: {
            "Authorization": `Bearer ${newToken}`,
            "Content-Type": "application/json-patch+json",
            "Accept": "*/*",
          },
        }
    );

    console.log("✅ Success:", response.data);
    //setNewId(response.data.id)

  } catch (error) {
    console.error("❌ Error:", error.response ? error.response.data : error.message);
  } finally {
    console.error("vinay", error.response ? error.response.data : error.message);
    setNewId("121");
  }
};

const StandardTimeMappings = {
  "Eastern Time": "Eastern Standard Time",
  "Central Time": "Central Standard Time",
  "Mountain Time": "Mountain Standard Time",
  "Arizona Time": "US Mountain Standard Time",
  "Pacific Time": "Pacific Standard Time",
  "Alaska Time": "Alaskan Standard Time",
  "Hawaii Time": "Hawaiian Standard Time",
};

// Function to get the Standard Time name using value
export function formatTimezone(value) {
  const timezone = Timezones.find(tz => tz.value === value);
  return timezone ? StandardTimeMappings[timezone.label] : "Unknown Standard Time";
}


  
