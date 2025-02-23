import React, {useEffect, useState} from "react";
import logo from "../assets/img/logo.png";
import TabHeader from "../components/TabHeader";
import TabOne from "../components/TabOne";
import TabTwo from "../components/TabTwo";
import TabThree from "../components/TabThree";
import {getAccessToken, redirectToAuth, refreshAccessToken } from "../utils/findToken";


const Home = () => {
    const [tab, setTab] = useState(2);
    const handleSubmit3 = async ()=>{
        await redirectToAuth();
    }
    useEffect(() => {
        getAccessToken();

        const interval = setInterval(async () => {
            console.log("Refreshing access token...");
            await refreshAccessToken();
        }, 8 * 60 * 1000); // Refresh every 8 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <section className="main">
                <button className={"tokenREqBtn"} onClick={handleSubmit3}>Login</button>
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

export default Home;
