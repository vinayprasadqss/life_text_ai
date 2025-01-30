import React, { useState } from "react";
import Timezones from "../constants/zone";
import { parseDaysInput, parseTimeInput, validateField } from "../utils/util";
import PhoneInput from "react-phone-input-2";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

const TabTwo = () => {
  const [friendName, setFriendName] = useState("");
  const [friendMobile, setFriendMobile] = useState("");
  const [msg, setMsg] = useState("");
  const [days, setDays] = useState("");
  const [time, setTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, "");

    if (phoneNumber.length === 0) return ""; // Allow full deletion

    if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };


  const handleChange = (e, setter) => {
    const rawValue = e.target.value;
    const formattedNumber = formatPhoneNumber(rawValue);
    setter(formattedNumber);
  };


  const handleKeyDown = (e, setter) => {
    if (e.key === "Backspace" && e.target.value.length === 1) {
      setter(""); // Allow full deletion when pressing backspace
    }
  };



  const handleError = (field, value) => {
    const error = validateField(field, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const handleSubmit = async () => {
    if (!recaptchaVerified) {
      alert("Please verify the reCAPTCHA.");
      return;
    }
    // Validate required fields
    const requiredFields = {
      name,
      email,
      phone,
      msg,
      days,
      time,
      timeZone,
      friendName,
      friendMobile,
    };
    const emptyFields = Object.entries(requiredFields).filter(
      ([key, value]) => value === ""
    );

    if (emptyFields.length > 0) {
      emptyFields.forEach(([key]) =>
        handleError(key === "timeZone" ? "timezone" : key, ``)
      );
      return;
    }

    try {
      setLoading(true);

      // Dummy API call using axios
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/posts",
        {
          name,
          email,
          phone,
          msg,
          days,
          time,
          timeZone,
          friendName,
          friendMobile,
        }
      );

      if (response.status === 201) {
        alert("Message scheduled successfully!");
        console.log("API Response:", response.data);
        setTab(3);
      } else {
        alert("Failed to schedule the message. Please try again.");
        console.error("API Error:", response.data);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptcha = (value) => {
    console.log("reCAPTCHA Verified:", value);
    setRecaptchaVerified(!!value); // Set to true if value exists
  };

  return (
    <div className="wrapper">
      <div className="form-wrap">
        <div className="form-control">
          <label>Who would you like to text?</label>
          <input
            className={error?.friendName && "error"}
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            type="text"
            placeholder="Their Name"
            onBlur={() => handleError("friendName", friendName)}
          />
          {
            <span className={error?.friendName ? "error" : "error2"}>
              {error.friendName ? error?.friendName : "-"}
            </span>
          }
        </div>
        <div className="form-control">
          <label>What's their mobile number?</label>

          <input
              type="text"
              value={friendMobile}
              Class={error?.friendMobile && "error"}
              onChange={(e) => handleChange(e, setFriendMobile)}
              onKeyDown={(e) => handleKeyDown(e, setFriendMobile)}
              maxLength={14}
              placeholder="(_ _ _) - _ _ _ - _ _ _ _ _"
              onBlur={() => handleError("friendMobile", friendMobile)}
          />
          {
            <span className={error?.friendMobile ? "error" : "error2"}>
              {error.friendMobile ? error?.friendMobile : "-"}
            </span>
          }
        </div>
      </div>
      <div className="form-wrap">
        <div className="form-control">
          <label>Text Message to Send:</label>
          <textarea
            className={error?.msg && "error"}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Enter Your Message"
            onBlur={() => handleError("msg", msg)}
          ></textarea>
          {
            <span className={error?.msg ? "error" : "error2"}>
              {error.msg ? error?.msg : "-"}
            </span>
          }
        </div>
      </div>
      <div className="form-wrap">
        <div className="form-control">
          <label>Days to Send:</label>
          <input
            className={error?.days && "error"}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            type="text"
            placeholder="Examples: Weekdays, Wed-Sat, etc."
            onBlur={() => {
              handleError("days", days);
              setDays(parseDaysInput(days));
            }}
          />
          {
            <span className={error?.days ? "error" : "error2"}>
              {error.days ? error?.days : "-"}
            </span>
          }
        </div>
        <div className="form-control">
          <label>Time to Send:</label>
          <input
            className={error?.time && "error"}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            type="text"
            placeholder="Example: 8:00 AM"
            onBlur={() => {
              handleError("time", time);
              setTime(parseTimeInput(time)?.value);
            }}
          />
          {
            <span className={error?.time ? "error" : "error2"}>
              {error.time ? error?.time : "-"}
            </span>
          }
        </div>
        <div className="form-control">
          <label>Their Time Zone:</label>
          <select
            className={error?.timezone && "error"}
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            onBlur={() => handleError("timezone", timeZone)}
          >
            <option value={""}>Select Timezone</option>
            {Timezones?.map((d) => (
              <option value={d?.value} key={d?.value}>
                {d?.label}
              </option>
            ))}
          </select>
          {
            <span className={error?.timezone ? "error" : "error2"}>
              {error.timezone ? error?.timezone : "-"}
            </span>
          }
        </div>
      </div>
      <div className="form-wrap">
        <div className="form-control">
          <label>Your Name:</label>
          <input
            className={error?.name && "error"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Enter Your Name"
            onBlur={() => handleError("name", name)}
          />
          {
            <span className={error?.name ? "error" : "error2"}>
              {error.name ? error?.name : "-"}
            </span>
          }
        </div>
        <div className="form-control">
          <label>Your Email:</label>
          <input
            className={error?.email && "error"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter Your Email"
            onBlur={() => handleError("email", email)}
          />
          {
            <span className={error?.email ? "error" : "error2"}>
              {error.email ? error?.email : "-"}
            </span>
          }
        </div>
        <div className="form-control">
          <label>Your Mobile Number:</label>

          <input
              type="text"
              value={phone}
              class={error?.phone && "error"}
              onChange={(e) => handleChange(e, setPhone)}
              onKeyDown={(e) => handleKeyDown(e, setPhone)}
              maxLength={14}
              placeholder="(_ _ _) - _ _ _ - _ _ _ _ _"
              onBlur={() => handleError("phone", phone)}
          />



          {
            <span className={error?.phone ? "error" : "error2"}>
              {error.phone ? error?.phone : "-"}
            </span>
          }
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "-5px",
          marginBottom: "20px",
          display: "block",
        }}
      >
        <ReCAPTCHA
          sitekey="6LcjlpgqAAAAAPQZx-5MULrhxpTfcS_DbkP6aJAX" // Replace with your actual site key
          onChange={handleRecaptcha}
        />
      </div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Schedule Message"}
      </button>
    </div>
  );
};

export default TabTwo;
