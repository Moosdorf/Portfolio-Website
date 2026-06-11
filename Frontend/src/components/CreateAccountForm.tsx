import { useState } from "react";

type Props = {
    onSwitch: () => void;
    passwordWeak: boolean;
    validatePassword: (password: string) => boolean;
    onSubmit: (username: string, password: string, email: string) => void;
    fetchingData: boolean;
}

export function CreateAccountForm({ onSwitch, passwordWeak, onSubmit, fetchingData }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    return (
        <>
            <input type="text" placeholder="Username" value={username}
                onChange={e => setUsername(e.target.value)} className="p-2 border rounded" />
            {passwordWeak && (
                <span className="text-red-500 text-sm">
                    Password must be at least 8 characters and contain a number.
                </span>
            )}
            <input type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} className="p-2 border rounded" />
            <input type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} className="p-2 border rounded" />
            <button type="button" onClick={() => onSubmit(username, password, email)}
                className={`text-white p-2 rounded ${fetchingData ? "bg-green-400" : "bg-green-500 hover:bg-green-600"}`}>
                {fetchingData ? "Creating account..." : "Create Account"}
            </button>
            <button type="submit" onClick={onSwitch}
                className="text-sm text-gray-600 hover:underline mx-auto">
                Back
            </button>
        </>
    );
}