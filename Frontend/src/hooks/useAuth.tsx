import { useState } from "react";

export function useAuth() {
    const [fetchingData, setFetchingData] = useState(false);
    const [passwordWeak, setPasswordWeak] = useState(false);

    const validatePassword = (password: string) => {
        return password.length >= 8 && /\d/.test(password);
    };

    const login = async (username: string, password: string) => {
        setFetchingData(true);
        try {
            const response = await fetch(`https://localhost:5270/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
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
            setPasswordWeak(true);
            return;
        }

        setPasswordWeak(false);
        
        try {
            const response = await fetch(`https://localhost:5270/api/auth/new`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email })
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setFetchingData(false);
        }
    };

    return { login, register, fetchingData, passwordWeak, setPasswordWeak, validatePassword };
}