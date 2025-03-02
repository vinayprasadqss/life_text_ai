import React, { useEffect, useState } from "react";
import logo from "../assets/img/logo.png";
import TabHeader from "../components/TabHeader";
import TabOne from "../components/TabOne";
import TabTwo from "../components/TabTwo";
import TabThree from "../components/TabThree";
import {getAccessToken, redirectToAuth, refreshAccessToken, loginUser, newTokenGen } from "../utils/findToken";
import AuthButton from "../components/AuthPopup";

const Home = () => {
    const [tab, setTab] = useState(1);
    const [username, setUserName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const handleSubmit3 = async ()=>{
        await redirectToAuth();
    }
    useEffect(() => {
        //loginUser()
        const autoLogin = async () => {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code"); // Check if auth code exists in URL

            if (code) {
                console.log("Authorization code found, exchanging for access token...");
                //await getAccessToken();
                await newTokenGen(setUserName, setIsLoggedIn);//
            } else if (accessToken) {
                console.log("Existing access token found, refreshing token...");
                //await handleTokenRefresh();
                await newTokenGen(setUserName, setIsLoggedIn);//
            } else if (refreshToken) {
                console.log("No access token, trying to refresh with refresh token...");
                //await handleTokenRefresh();
                await newTokenGen(setUserName, setIsLoggedIn);//
            } else {
                console.log("No tokens found, redirecting to login...");
                //await redirectToAuth(); // First-time login
                await newTokenGen(setUserName, setIsLoggedIn);//
            }
        };

        autoLogin();

        // 🔹 Auto-refresh the token every 10 minutes
        const interval = setInterval(async () => {
            //await handleTokenRefresh();
            await newTokenGen(setUserName, setIsLoggedIn);//
        }, 20 * 60 * 1000); // Every 10 minutes

        return () => clearInterval(interval);
    }, []);

    // Function to handle token refresh and detect expiration
    const handleTokenRefresh = async () => {
        try {
            const newAccessToken = await refreshAccessToken();
            if (!newAccessToken) {
                console.warn("⚠️ Refresh token expired. Redirecting to login...");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                await redirectToAuth();
            }
        } catch (error) {
            console.error("❌ Error while refreshing token:", error);
            await redirectToAuth(); // If any error occurs, force login
        }
    };



    return (
        <>
            <section className="main">
                <AuthButton setUserName={setUserName} username={username} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
                {/*<button className={"tokenREqBtn"} onClick={handleSubmit3}>Login</button>*/}
                <div className="logo">
                    <img src={logo} alt="logo" />
                </div>
                <h1>Schedule Your 1st Text</h1>

                <div className="tab">
                    <TabHeader tab={tab} setTab={setTab} />
                    {tab === 3 ? <TabThree setTab={setTab} /> : tab === 1 ? <TabOne setTab={setTab} /> : <TabTwo setTab={setTab} />}
                </div>
            </section>
        </>
    );
};

export default Home;
