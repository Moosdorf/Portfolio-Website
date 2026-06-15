import { createContext, useContext, useState } from 'react';

type AuthContextType = {
    user: any;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (username: string, password: string, email: string) => Promise<void>;
    fetchingData: boolean;
    loginSuccessful: null | boolean;
    passwordWeak: boolean;
    resetErrors: () => void;
    validatePassword: (password: string) => boolean;
    emailTaken: boolean;
    setEmailTaken: React.Dispatch<React.SetStateAction<boolean>>;
    usernameTaken: boolean;
    setUsernameTaken: React.Dispatch<React.SetStateAction<boolean>>;
    amILoggedIn: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);  

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
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

    const login = async (username: string, password: string) => {
        setFetchingData(true);
        try {
            const response = await fetch(`https://localhost:5270/api/auth/login`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            setLoginSuccessful(response.ok)
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            console.log(response);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            amILoggedIn()
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
                credentials: 'include',
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
            amILoggedIn()
            setFetchingData(false);
        }
    };


    const amILoggedIn = async () => {
        const response = await fetch('https://localhost:5270/api/auth/me', {
            method: "GET",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            console.log("Not logged in:", response.status);
            return false;
        }

        const user = await response.json();
        setUser(user)
        return true;
    };

    const logout = async () => {
        await fetch('https://localhost:5270/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        setUser(null)
    }

    const resetErrors = () => {
        setPasswordWeak(false);
        setEmailTaken(false);
        setUsernameTaken(false);
        setLoginSuccessful(null);
    };



  return (
    <AuthContext.Provider value={{ login, amILoggedIn, user, logout, register, fetchingData, loginSuccessful, passwordWeak, resetErrors, validatePassword, emailTaken, setEmailTaken, usernameTaken, setUsernameTaken }}>
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context  
}
