import React, { useState, useEffect } from "react";
import {decodeJwt} from './../utils/util';

const AuthPopup = ({ onClose, onLoginSuccess, setUserName }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [serverError, setServerError] = useState("");

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


    const handleLogin = async () => {

        setEmailError("");
        setPasswordError("");
        setServerError("");


        let isValid = true;

        // Email Validation
        if (!emailRegex.test(email)) {
            setEmailError("Invalid email format");
            isValid = false;
        }

        // Password Validation
        if (!passwordRegex.test(password)) {
            setPasswordError(
                "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
            );
            isValid = false;
        }

        if (!isValid) return; // Stop if validation fails



        try {
            const response = await fetch("https://ra-id-staging.azurewebsites.net/connect/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    "grant_type": "password",
                    "client_id": "mobile",
                    "client_secret": "secret",
                    "username": email,
                    "password": password,
                }).toString(),
            });

            const data = await response.json();

            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                localStorage.setItem("tokenRequestValue", data?.access_token);
                const decoded = decodeJwt(data.access_token);
                setUserName('decoded?.name');
                onLoginSuccess(); // Update UI after login

                onClose(); // Close popup
            } else {
                setServerError(data.error_description || "Login failed. Please try again.");
            }

        } catch (error) {
            setServerError("Something went wrong. Please try again.");
        }
    };

    return (
    <div className="modelOverlay loginPage">
        <div className="modelBox">
            <div className="head">
                <h2>Login</h2>
                <div className="closeIcon" onClick={onClose}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 30 30"
                        width="30px"
                        height="30px"
                    >
                        <path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z" />
                    </svg>
                </div>
            </div>
            <div className="body">
                {/*<h1>Login</h1>*/}
                <div className="formGroup">
                    <label>Email </label>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {emailError && <p className="error">{emailError}</p>}
                </div>
                <div className="formGroup">
                    <label>password </label>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {passwordError && <p className="error">{passwordError}</p>}
                </div>
                {serverError && <p className="error">{serverError}</p>}
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    </div>
    );
};

const AuthButton = ({username, setUserName, setIsLoggedIn, isLoggedIn}) => {

    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
    };

    return (
        <>
            {isLoggedIn ? (
                <div className={"loginBtnWrap"}>{username} <button className={"tokenREqBtn"} onClick={handleLogout}>Logout</button></div>
            ) : (
                <button className={"tokenREqBtn"} onClick={() => setShowPopup(true)}>Login</button>
            )}
            {showPopup && <AuthPopup onClose={() => setShowPopup(false)} onLoginSuccess={() => setIsLoggedIn(true)} setUserName = {setUserName} />}
        </>
    );
};

export default AuthButton;
