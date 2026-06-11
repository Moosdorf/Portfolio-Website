import { useState } from "react";

type Props = {
    onSwitch: () => void;
    fetchingPassword: boolean;
    onSubmit: (username: string, password: string) => void;
}

export function LoginForm({ onSwitch, fetchingPassword, onSubmit }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <>
            <input type="text" placeholder="Username" value={username}
                onChange={e => setUsername(e.target.value)} className="p-2 border rounded" />
            <input type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} className="p-2 border rounded" />
            <button type="button" disabled={fetchingPassword}
                onClick={() => onSubmit(username, password)}
                className={`text-white p-2 rounded ${fetchingPassword ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"}`}>
                {fetchingPassword ? "Logging in..." : "Log In"}
            </button>
            <button type="button" onClick={onSwitch}
                className="text-sm text-gray-600 hover:underline mx-auto">
                Back
            </button>
        </>
    );
}