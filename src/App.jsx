import React, { useState } from "react";
import logo from "./assets/img/logo.png";
import TabHeader from "./components/TabHeader";
import TabOne from "./components/TabOne";
import TabTwo from "./components/TabTwo";
import TabThree from "./components/TabThree";

const App = () => {
  const [tab, setTab] = useState(1);

  return (
    <>
      <section className="main">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <h1>Schedule Your 1st Text</h1>

        <div className="tab">
          <TabHeader tab={tab} setTab={setTab} />

          {tab === 3 ? (
            <TabThree setTab={setTab} />
          ) : tab === 1 ? (
            <TabOne setTab={setTab} />
          ) : (
            <TabTwo setTab={setTab} />
          )}
        </div>
      </section>
    </>
  );
};

export default App;
