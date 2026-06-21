import { useState } from "react";

type Props = {
    onSwitch: () => void;
    fetchingPassword: boolean;
    passwordWeak: boolean;
    loginSuccessful: null | boolean;
    onSubmit: (username: string, password: string) => void;
    validatePassword: (password: string) => boolean;
}

export function LoginForm({ onSwitch, fetchingPassword, validatePassword, passwordWeak, loginSuccessful, onSubmit }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    return (
        <>
            {/* error message */}
            {loginSuccessful === false && (<p className="error text-sm">
                Username or password is incorrent.
            </p>)}

            {/* username */}
            <input type="text" placeholder="Username" value={username}
                onChange={e => setUsername(e.target.value)} className="p-2 border rounded" />


            {/* password */}
            {passwordWeak && (
                <p className="error text-sm">
                    Password must be at least 8 characters and contain a number.
                </p>)}
            <input type="password" placeholder="Password" value={password}
                onChange={e => {
                        setPassword(e.target.value)
                        validatePassword(e.target.value);
                    }} className="p-2 border rounded" />


            {/* buttons */}
            <button type="button" disabled={fetchingPassword}
                onClick={() => onSubmit(username, password)}
                className={`p-2 rounded ${fetchingPassword ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"}`}>
                {fetchingPassword ? "Logging in..." : "Log In"}
            </button>

            <button type="button" onClick={onSwitch}
                className="text-sm hover:underline mx-auto">
                Back
            </button>
        </>
    );
}