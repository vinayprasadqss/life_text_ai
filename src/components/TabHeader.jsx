import React from "react";

const TabHeader = ({ tab, setTab }) => {
  return (
    <ul>
      <li className={tab === 1 ? "active" : ""} onClick={() => setTab(1)}>
        Send to Yourself
      </li>
      <li className={tab === 2 ? "active" : ""} onClick={() => setTab(2)}>
        Send to someone Else
      </li>
    </ul>
  );
};

export default TabHeader;
