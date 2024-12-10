import React from "react";
import logo from "./assets/img/logo.png";

const App = () => {
  return (
    <>
      <section class="main">
        <div class="logo">
          <img src={logo} alt="logo" />
        </div>
        <h1>Schedule Your 1st Text</h1>

        <div class="tab">
          <ul>
            <li class="active">Send to Yourself</li>
            <li>Send to someone Else</li>
          </ul>
        </div>
        <div class="wrapper">
          <div class="form-wrap">
            <div class="form-control">
              <label>Your First Name:</label>
              <input type="text" placeholder="Enter your first name" />
            </div>
            <div class="form-control">
              <label>Your Email:</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            <div class="form-control">
              <label>Your Mobile Number:</label>
              <input type="text" placeholder="Enter your mobile number" />
            </div>
          </div>
          <div class="form-wrap">
            <div class="form-control">
              <label>Text Message to Send Yourself:</label>
              <textarea placeholder="Enter your message here"></textarea>
            </div>
          </div>
          <div class="form-wrap">
            <div class="form-control">
              <label>Days to Send:</label>
              <input
                type="text"
                placeholder="Examples: Weekdays, Wed-Sat, etc."
              />
            </div>
            <div class="form-control">
              <label>Time to Send:</label>
              <input type="text" placeholder="Example: 8:00 AM" />
            </div>
            <div class="form-control">
              <label>Your Time Zone:</label>
              <input type="text" placeholder="Example: Eastern" />
            </div>
          </div>
          <button>Schedule Message</button>
        </div>
      </section>
    </>
  );
};

export default App;
