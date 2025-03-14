import React, {useEffect, useState} from "react";
import axios from "axios";
import Timezones from "../constants/zone";
import { parseDaysInput, parseTimeInput, validateField, transformPayloadSingle, transformPayloadDouble, formatTimezone } from "../utils/util";
import { redirectToAuth, getAccessToken } from "../utils/findToken";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import ReCAPTCHA from "react-google-recaptcha";
import RequestToken from "./TokkenRequest";
import Toast from "./Toast";

const TabOne = ({setTab}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [days, setDays] = useState("");
  const [time, setTime] = useState("");
  const [timeZone, setTimeZone] = useState("America/Chicago");
  const [error, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [tokenRequest, setTokenRequest] = useState(false);
  const [newId, setNewId] = useState('');

    const recaptchaRef = React.createRef(); // Ref for invisible reCAPTCHA
    const handleRecaptcha = async () => {
        try {
            const token = await recaptchaRef.current.executeAsync(); // Invisible reCAPTCHA
            recaptchaRef.current.reset(); // Reset after execution
            //console.log("Recaptcha Token:", token); // Log the token for debugging purposes

            // Here, instead of backend verification, we check if the token exists
            if (token) {
                setRecaptchaVerified(true); // Set to true when token is received
            }
        } catch (error) {
            console.error("reCAPTCHA error:", error);
        }
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

    const generateUniqueNumber = (numb = "000") => {
        // Generate a random 3-digit number (excluding first 3 and fixed middle 000)
        const firstThree = Math.floor(100 + Math.random() * 900); // First 3 digits (100-999)
        const lastFour = Math.floor(1000 + Math.random() * 9000); // Last 4 digits (1000-9999)

        return parseInt(`${firstThree}${numb}${lastFour}`, 10); // Concatenating to get 10-digit number
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
    const handleSubmit3 = async ()=>{
        console.log(formatTimezone(timeZone))
    }

    const signupUser = async () => {
        if (!recaptchaVerified) {
            alert("Please verify the reCAPTCHA.");
            return;
        }
        // Validate required fields
        const requiredFields = { name, phone, msg, days, time, timeZone };
        const emptyFields = Object.entries(requiredFields).filter(([key, value]) => value === "");

        if (emptyFields.length > 0) {
            emptyFields.forEach(([key]) => handleError(key === "timeZone" ? "timezone" : key, ""));
            return;
        }

        const newToken = localStorage.getItem("tokenRequestValue");

        const elderPhNumAuto = generateUniqueNumber('000'); // Generate a 10-digit unique phone number
        const championPhNumAuto = generateUniqueNumber('001'); // Generate a 10-digit unique phone number

        try {
            setLoading(true);
            const response = await axios.post(
                "https://ra-user-staging.azurewebsites.net/v1/signup",
                {
                    elder: {
                        name: name,
                        timeZone: formatTimezone(timeZone),
                        phoneNumber: phone,
                    },
                    champion: {
                        phoneNumber: championPhNumAuto,
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
        if (days.includes("to")||days=="All 7 days of the week"||days=="Saturday & Sunday"||days.includes(",")) {
            promptSchedule = transformPayloadDouble(timeZone, days, time);
        } else {
            promptSchedule = transformPayloadSingle(timeZone, days, time);
        }

        const payload = {
            message: `Hi ${name}, ${msg}`,
            workflowType: 5,
            recipientRoles: 4,
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
            console.log("error vinay",error);
            Toast("Error",  error?.response?.data.errors[0].description || error?.response || error?.message ||"Something went wrong.", "error");
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

    useEffect(() => {
        handleRecaptcha();
    }, []);

    return (
    <div className="wrapper">
        <button style={{display:"none"}} className={"tokenREqBtn"} onClick={()=> setTokenRequest(true)}>Click</button>
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
            <input
                type="text"
                className={error?.phone && "error"}
                value={formatPhoneNumber(phone)}
                onChange={(e) => handleChange(e, setPhone)}
                onKeyDown={(e) => handleKeyDown(e, setPhone)}
                maxLength={14}
                onBlur={() => handleError("phone", phone)}
                placeholder="(_ _ _) - _ _ _ - _ _ _ _ _"
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

        {/* Invisible reCAPTCHA v3 */}
        <div
            style={{
                textAlign: "center",
                marginTop: "-5px",
                marginBottom: "20px",
                display: "block",
            }}
        >
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LePf8wqAAAAAALmZTChTGOUGQmTD202ZNmzZZar" // Replace with your actual site key
                size="invisible"
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

export default TabOne;
