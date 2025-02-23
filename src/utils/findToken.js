const authorizeEndpoint = "https://ra-id-staging.azurewebsites.net/connect/authorize";
const tokenUrl = 'https://ra-id-staging.azurewebsites.net/connect/token';
const clientId = "client";
const scope ="openid profile championapi caregiverapi roles offline_access";
// Dynamically set redirect_uri from current browser URL
const redirect_uri = `${window.location.origin}/index.html`;

async function generatePKCE() {
    const codeVerifier = btoa(crypto.getRandomValues(new Uint8Array(32)).reduce((acc, byte) => acc + String.fromCharCode(byte), ''))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return { codeVerifier, codeChallenge };
}

export async function redirectToAuth() {
    const { codeVerifier, codeChallenge } = await generatePKCE();

    localStorage.setItem('code_verifier', codeVerifier); // Store for later use

    const args = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri:redirect_uri,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
    window.location.href = authorizeEndpoint + "?" + args; // Redirect user
}


function getAuthCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}


export async function getAccessToken() {
    const code = getAuthCodeFromUrl();
    const codeVerifier = localStorage.getItem('code_verifier'); // Retrieve stored `code_verifier`

    if (!code || !codeVerifier) {
        console.error('Authorization code or code_verifier missing!');
        return;
    }


    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', 'client');
    formData.append('client_secret', '123'); // If client secret is required
    formData.append('code', code);
    formData.append('redirect_uri', redirect_uri);
    formData.append('code_verifier', codeVerifier);

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();
        console.log('Access Token:', data);
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem("tokenRequestValue", data?.access_token);
            window.history.replaceState({}, document.title, window.location.pathname); // Remove auth code from URL to prevent reuse
        } else {
            console.error("Failed to retrieve access token.");
        }
    } catch (error) {
        console.error('Error getting access token:', error);
    }
}

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        console.error("No refresh token available");
        return;
    }

    const tokenUrl = 'https://ra-id-staging.azurewebsites.net/connect/token';

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', 'client');
    formData.append('redirect_uri', redirect_uri); // If required
    formData.append('refresh_token', refreshToken);

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            data?.access_token && localStorage.setItem("tokenRequestValue", data?.access_token);
            return data.access_token;
        } else {
            console.error("Failed to refresh token");
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
}

