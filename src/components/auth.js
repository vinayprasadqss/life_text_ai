import { UserManager } from "oidc-client-ts";

const oidcConfig = {
    authority: "https://your-oauth-provider.com", // Replace with your provider
    client_id: "your-client-id",
    redirect_uri: "http://localhost:3000/callback",
    response_type: "code",
    scope: "openid profile email",
    automaticSilentRenew: true,
};

const userManager = new UserManager(oidcConfig);

export const login = () => {
    userManager.signinRedirect();
};

export const handleCallback = async () => {
    await userManager.signinRedirectCallback();
};

export const getUser = async () => {
    return await userManager.getUser();
};

export const logout = () => {
    userManager.signoutRedirect();
};
