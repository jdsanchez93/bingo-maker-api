import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../auth/login-button";
import LogoutButton from "../auth/logout-button";
import Profile from "../auth/profile";
import { useState, useEffect } from "react";

export default function Dasboard() {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [message, setMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const getMessage = async () => {
            const accessToken = await getAccessTokenSilently();

            if (!isMounted) {
                return;
            }

            setMessage(accessToken)


        };

        getMessage();

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently]);

    if (isLoading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return (
            <div>
                <LoginButton />
            </div>
        );
    }

    return (
        <div>
            <h1>Dashboard!</h1>
            <h1>{message}</h1>
            <Profile />
            <LogoutButton />
        </div>
    );
}
