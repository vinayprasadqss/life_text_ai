import {
  isValidPhoneNumber,
  validatePhoneNumberLength,
} from "libphonenumber-js";
import moment from 'moment-timezone';



const daysMap = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
export function transformPayload(timeZone, days, times) {
  // Map common timezone names to IANA timezone names
  const timezoneMap = {
    "Eastern Standard Time": "America/New_York"
  };

  // Use the mapped timezone or the provided one
  const timeZone1 = timezoneMap[timeZone] || timeZone;

  // Get the current date in the target timezone
  const currentDate = moment().tz(timeZone);

  // Determine the next occurrence of the specified day (e.g., Monday)
  const targetDay = moment().tz(timeZone).day(days);

  // If today is the day but the time has passed, move to next week's occurrence
  if (targetDay.isBefore(currentDate, 'day') ||
      (targetDay.isSame(currentDate, 'day') && moment(times, "h:mm A").isBefore(currentDate))) {
    targetDay.add(1, 'weeks');
  }

  // Combine the target day and time
  const dateTime = moment.tz(
      `${targetDay.format('YYYY-MM-DD')} ${times}`,
      "YYYY-MM-DD h:mm A",
      timeZone1
  );

  // Construct the transformed payload
  return {
      date: dateTime.toISOString(),
      timeOfDay: dateTime.format('HH:mm:ss'),
      isEnabled: true
  };
}

export const parseDaysInput = (input) => {
  const normalizedInput = input.trim().toLowerCase();


  switch (normalizedInput) {
    case "monday":
    case "m":
    case "mon":
      return "Monday";
    case "tuesday":
    case "t":
    case "tue":
    case "tues":
      return "Tuesday";
    case "wednesday":
    case "w":
    case "we":
    case "wed":
      return "Wednesday";
    case "thursday":
    case "th":
    case "thu":
    case "thur":
      return "Thursday";
    case "friday":
    case "f":
    case "fr":
    case "fri":
      return "Friday";
    case "saturday":
    case "sat":
    case "sa":
      return "Saturday";
    case "sunday":
    case "s":
    case "su":
    case "sun":
      return "Sunday";
    case "everyday":
      return "All 7 days of the week";
    case "weekdays":
      return "Monday - Friday";
    case "weekends":
      return "Saturday & Sunday";
    case "today":
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
    return { msg: "", value: formatTo12Hour(hours, minutes) };
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
        if (!value.trim()) {
          error = "Please provide your phone number.";
        } else {
          const data = validatePhoneNumber(value);
          if (data && data.message) {
            error = data.message;
          }
        }
        break;
        case "friendMobile":
          if (!value.trim()) {
            error = "Please provide their phone number.";
          } else {
            const data = validatePhoneNumber(value);
            if (data && data.message) {
              error = data.message;
            }
          }
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
  
