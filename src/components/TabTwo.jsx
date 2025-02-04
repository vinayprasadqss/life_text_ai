import React, {useEffect, useState} from "react";
import Timezones from "../constants/zone";
import {
  parseDaysInput,
  parseTimeInput,
  transformPayloadDouble,
  transformPayloadSingle,
  validateField
} from "../utils/util";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import RequestToken from "./TokkenRequest";
import {getAccessToken, redirectToAuth} from "../utils/findToken";
import Toast from './Toast';



const TabTwo = ({setTab}) => {
  const [friendName, setFriendName] = useState("");
  const [friendMobile, setFriendMobile] = useState("");
  const [msg, setMsg] = useState("Hello");
  const [days, setDays] = useState("Sunday");
  const [time, setTime] = useState("9:00 AM");
  const [timeZone, setTimeZone] = useState("America/Chicago");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [tokenRequest, setTokenRequest] = useState(false);
  const [newId, setNewId] = useState('');

  const handleRecaptcha = (value) => {
    setRecaptchaVerified(!!value); // Set to true if value exists
  };

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
    const rawValue = e.target.value.replace(/\D/g, ""); // Store only numbers
    setter(rawValue);
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

  const handleSubmit3 = async ()=>{
    await redirectToAuth();

    await getAccessToken();
  }
  const signupUser = async () => {
    if (!recaptchaVerified) {
      alert("Please verify the reCAPTCHA.");
      return;
    }
    // Validate required fields
    const requiredFields = { friendName,friendMobile, phone, msg, days, time, timeZone };
    const emptyFields = Object.entries(requiredFields).filter(([key, value]) => value === "");

    if (emptyFields.length > 0) {
      emptyFields.forEach(([key]) => handleError(key === "timeZone" ? "timezone" : key, ""));
      return;
    }

    const newToken = localStorage.getItem("tokenRequestValue");

    try {
      setLoading(true);
      const response = await axios.post(
          "https://ra-user-staging.azurewebsites.net/v1/signup",
          {
            elder: {
              name: friendName,
              timeZone: "Eastern Standard Time",
              phoneNumber: friendMobile,
            },
            champion: {
              phoneNumber: phone,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json-patch+json",
              Accept: "*/*",
            },
          }
      );

      console.log("✅ Success: vinay3", response.data);
      setNewId(response.data.id);
      //Toast("Success", "Congratulations, your message has been scheduled!"); // Success toast
    } catch (error) {
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          Toast("Notification", "Unauthorized access. Please log in again.", "error");
        } else {
          Toast((error.response.statusText||"Error"), error.response.data.errors[0].description || "Something went wrong.", "error");
        }
      } else if (error.message.includes("Network Error")) {
        // Handling CORS or network errors
        Toast("CORS Error", "Cross-Origin Request Blocked. Please check API permissions.", "error");
      } else {
        Toast("Error", "An unexpected error occurred.", "error");
      }

      console.error("❌ Error:", error.message);
    } finally {
      setLoading(false);
    }
  };





  const handleSubmit2 = async () => {
    const newToken = localStorage.getItem('tokenRequestValue');
    const url = `https://ra-user-staging.azurewebsites.net/v1/journeys/${newId}/prompts`;

    let promptSchedule;
    if (days.includes("to")) {
      promptSchedule = transformPayloadDouble(timeZone, days, time);
    } else {
      promptSchedule = transformPayloadSingle(timeZone, days, time);
    }

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
       /* alert("Message scheduled successfully!");*/
        console.log("API Response:", response.data);
        setTab(3)
      } else {
        Toast("Error", "Failed to schedule the message. Please try again.", "error");
        console.error("API Error:", response.data);
      }
    } catch (error) {
      Toast("Error", error.response || error.message ||"Something went wrong.", "error");
      console.error("API Error:", error.response || error.message);
    } finally {
      setLoading(false);
      console.log("finally call")
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (newId) { // Run only if newId has a value
        await handleSubmit2();
      }
    };
    fetchData(); // Call the async function
  }, [newId]); // Dependency array


  return (
    <div className="wrapper">
      <button className={"tokenREqBtn"} onClick={()=> setTokenRequest(true)}>Click</button>
      {tokenRequest && <RequestToken tokenRequest={tokenRequest} setTokenRequest={setTokenRequest}/>}
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
              value={formatPhoneNumber(friendMobile)}
              className={error?.friendMobile && "error"}
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
              value={formatPhoneNumber(phone)}
              className={error?.phone && "error"}
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
      <button onClick={signupUser} disabled={loading}>
        {/*{loading ? "Submitting..." : "Schedule Message"}*/}
        Schedule Message
      </button>
      {loading && <div className="loaderScreen">
        <div className="circle-spinner"></div>
        Scheduling...
      </div>}
    </div>
  );
};

export default TabTwo;
