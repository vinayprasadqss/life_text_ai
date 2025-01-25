import React, { useState } from "react";
import axios from "axios";
import Timezones from "../constants/zone";
import { parseDaysInput, parseTimeInput, validateField, transformPayloadSingle, transformPayloadDouble } from "../utils/util";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import ReCAPTCHA from "react-google-recaptcha";
import RequestToken from "./TokkenRequest";

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

      const newToken = localStorage.getItem('tokenRequestValue');

    const url = "https://ra-user-staging.azurewebsites.net/v1/journeys/121/prompts";
      let promptSchedule;

      if (days.includes("to")) {
          promptSchedule = transformPayloadDouble(timeZone, days, time);
      } else {
          promptSchedule = transformPayloadSingle(timeZone, days, time);
      }
    // const promptSchedule = transformPayloadSingle(timeZone, days, time);
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
                Authorization: `Bearer ${newToken}`,
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
    } finally {
        console.log("finally call")
        setLoading(false);
    }
};

  const handleRecaptcha = (value) => {
    console.log("reCAPTCHA Verified:", value);
    setRecaptchaVerified(!!value); // Set to true if value exists
  };


  const [tokenRequest, setTokenRequest] = useState(false);
  return (
    <div className="wrapper">
        <button className={"tokenREqBtn"} onClick={()=> setTokenRequest(true)}>Click</button>
        {tokenRequest && <RequestToken tokenRequest={tokenRequest} setTokenRequest={setTokenRequest}/>}
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
            inputClass={error?.phone ? "error ":""}
            value={phone}
            onChange={(value) => setPhone(value)}
            placeholder="(_ _ _) - _ _ _ - _ _ _ _ _ "
            containerStyle={{ marginTop: "4px" }}
            //onBlur={() => handleError("phone", phone)}

            country="us"
            onlyCountries={['us']}
            disableDropdown={true}
            enableAreaCodes={false}
            buttonStyle={{
                display: 'none', // Hides the flag and dropdown button
            }}
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
