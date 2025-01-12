import React, { useState } from "react";
import axios from "axios";
import Timezones from "../constants/zone";
import { parseDaysInput, parseTimeInput, validateField, transformPayload } from "../utils/util";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import ReCAPTCHA from "react-google-recaptcha";

const TabOne = ({setTab}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [days, setDays] = useState("");
  const [time, setTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [error, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);

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
  const requiredFields = { name, email, phone, msg, days, time, timeZone };
  const emptyFields = Object.entries(requiredFields).filter(([key, value]) => value === "");

  if (emptyFields.length > 0) {
    emptyFields.forEach(([key]) => handleError(key==="timeZone" ? "timezone":key, ``));
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
        }
      );

      if (response.status === 201) {
        alert("Message scheduled successfully!");
        console.log("API Response:", response.data);
        setTab(3)
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

  const handleSubmit2 = async () => {
      if (!recaptchaVerified) {
          alert("Please verify the reCAPTCHA.");
          return;
      }
      // Validate required fields
      const requiredFields = { msg, days, time, timeZone };
      const emptyFields = Object.entries(requiredFields).filter(([key, value]) => value === "");

      if (emptyFields.length > 0) {
          emptyFields.forEach(([key]) => handleError(key==="timeZone" ? "timezone":key, ``));
          return;
      }


    const url = "https://ra-user-staging.azurewebsites.net/v1/journeys/121/prompts";
    const promptSchedule = transformPayload(timeZone, days, time);
    const payload = {
        message: msg,
        workflowType: 5,
        followUp: 0,
        isEnabled: true,
        promptSchedule,
        promptMediaIds: [],
    };

    try {
        setLoading(true);
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkNDMTQzOTI3REFEODlDMkIyREJBNjM2NTg1QTBBQkJCIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.eyJuYmYiOjE3MzY2Nzc0NjMsImV4cCI6MTczNjY3ODA2MywiaXNzIjoiaHR0cHM6Ly9yYS1pZC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0IiwiYXVkIjoiaHR0cHM6Ly9yYS1pZC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0L3Jlc291cmNlcyIsImNsaWVudF9pZCI6ImNsaWVudCIsInN1YiI6IjUyIiwiYXV0aF90aW1lIjoxNzM2NDEyMDI1LCJpZHAiOiJsb2NhbCIsIm5hbWUiOiJQYW5rYWogV2FkaHdhIiwiZW1haWwiOiJwYW5rYWpAcXNzdGVjaG5vc29mdC5jb20iLCJzcyI6IkpWQ0M2VDRYVjRLRUJFMkZLVTJFRTZKQVBKSVJSSlBGIiwicm9sZSI6WyJjaGFtcGlvbiIsImNhcmVnaXZlciJdLCJqdGkiOiI0RjVDQkRCQTUwMjg5MDQ0RDBCQkFEQUVFQjYxOTZFQyIsInNpZCI6Ijk5RkUxRjBDMUUxRTY1QUIyQzQwRUM4RUI4OEFEQ0IyIiwiaWF0IjoxNzM2NjY1NjIwLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiY2hhbXBpb25hcGkiLCJjYXJlZ2l2ZXJhcGkiLCJyb2xlcyIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.KSJygelh5Mi8Ys0NnBa3NtR2XnbAbzYjG61YV_z0WJJPqxnTjymCqIQ6RTPuC1XpmPG3pp5scIqiGMVESEnKrT5vg0xGiy7iMZKyvpEn6fqSBw4754vvt0U6GRTshc1GuFoPZpqZ2Jp8BvsP4PyhueFBe62tlpS9GngO3fnwO3fmT3WzXquyP4HxXJxmxAPOmGlPL3B3e3OqA3BY1E-mR-wtgMJAdB1sgyJQUmKxQPaxjRDfo2tUoS6ZXiiza4tAViHJVSmyMlA5rs_p0prLXGXOvzRvNuuXPbQsJpzNCnwkaXutro8zjdw7Q_Juz0RtFbtH-yoT8FHaa2QJOW5FvQ`,
                "Content-Type": "application/json",
            },
        });

        console.log("API Response:", response.data);
        if (response.status === 200) {
            alert("Message scheduled successfully!");
            console.log("API Response:", response.data);
            setTab(3)
        } else {
            alert("Failed to schedule the message. Please try again.");
            console.error("API Error:", response.data);
        }
    } catch (error) {
        alert(error.response || error.message)
        console.error("API Error:", error.response || error.message);
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
          <label>Your First Name:</label>
          <input
            className={error?.name && "error"}
            type="text"
            placeholder="Enter your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error?.email && "error"}
            type="email"
            placeholder="Enter your email"
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
          <PhoneInput
            inputClass={error?.phone && "error"}
            value={phone}
            onChange={(value) => setPhone(value)}
            placeholder="(_ _ _) - _ _ _ - _ _ _ _ _ "
            containerStyle={{ marginTop: "4px" }}
            onBlur={() => handleError("phone", phone)}
          />
          {
            <span className={error?.phone ? "error" : "error2"}>
              {error.phone ? error?.phone : "-"}
            </span>
          }
        </div>
      </div>
      <div className="form-wrap">
        <div className="form-control">
          <label>Text Message to Send Yourself:</label>
          <textarea
            className={error?.msg && "error"}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onBlur={() => handleError("msg", msg)}
            placeholder="Enter your message here"
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
            onBlur={() => {
              handleError("days", days);
              setDays(parseDaysInput(days));
            }}
            type="text"
            placeholder="Examples: Weekdays, Wed-Sat, etc."
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
            onChange={(e) => setTime(e.target.value)}
            value={time}
            onBlur={() => {
              handleError("time", time);
              setTime(parseTimeInput(time)?.value);
            }}
            type="text"
            placeholder="Example: 8:00 AM"
          />
          {
            <span className={error?.time ? "error" : "error2"}>
              {error.time ? error?.time : "-"}
            </span>
          }
        </div>
        <div className="form-control">
          <label>Your Time Zone:</label>
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
      <button onClick={handleSubmit2} disabled={loading}>
        {loading ? "Submitting..." : "Schedule Message"}
      </button>
    </div>
  );
};

export default TabOne;
