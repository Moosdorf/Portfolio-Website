import { useState } from "react";

export function useAuth() {
    const [fetchingData, setFetchingData] = useState(false);
    const [passwordWeak, setPasswordWeak] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [loginSuccessful, setLoginSuccessful] = useState<null | true | false>(null); // null is no error, false is cannot log in, true = can log in

    const validatePassword = (password: string) => {
        var passwordValidated = password.length >= 8 && /\d/.test(password)
        setPasswordWeak(!passwordValidated);
        return passwordValidated;
    };

    const resetErrors = () => {
        setPasswordWeak(false);
        setEmailTaken(false);
        setUsernameTaken(false);
        setLoginSuccessful(null);
    };

    const login = async (username: string, password: string) => {
        setFetchingData(true);
        try {
            const response = await fetch(`https://localhost:5270/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            setLoginSuccessful(response.ok)
            if (!response.ok) throw new Error(`Error: ${response.status}`);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setFetchingData(false);
        }
    };

    const register = async (username: string, password: string, email: string) => {
        setFetchingData(true);

        if (!validatePassword(password)) {
            setFetchingData(false);
            return;
        }

        setPasswordWeak(false);
        
        try {
            const response = await fetch(`https://localhost:5270/api/auth/new`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email })
            });
            if (!response.ok) {
                const data = await response.json();
                console.log(data.errors);
                if (data.errors.email) setEmailTaken(true);
                if (data.errors.username) setUsernameTaken(true);
                throw new Error(`Error: ${response.status}`);
            }
            console.log(response);

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setFetchingData(false);
        }
    };

    return { login, register, fetchingData, loginSuccessful, passwordWeak, resetErrors, validatePassword, emailTaken, setEmailTaken, usernameTaken, setUsernameTaken };
}