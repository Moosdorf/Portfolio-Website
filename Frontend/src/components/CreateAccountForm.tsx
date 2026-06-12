import { useState } from "react";

type Props = {
    onSwitch: () => void;
    onSubmit: (username: string, password: string, email: string) => void;
    setUsernameTaken: (value: boolean) => void;
    setEmailTaken: (value: boolean) => void;
    validatePassword: (password: string) => boolean;
    fetchingData: boolean;
    passwordWeak: boolean;
    emailTaken: boolean;
    usernameTaken: boolean;
}

export function CreateAccountForm({ onSwitch, onSubmit, fetchingData, passwordWeak, validatePassword, emailTaken, usernameTaken, setUsernameTaken, setEmailTaken }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    return (
        <>
            {/* username */}
            <input type="text" placeholder="Username" value={username}
                required
                onChange={e => {
                        setUsername(e.target.value)
                        if (usernameTaken) {
                            setUsernameTaken(false);
                        }
                    }} className={`p-2 border rounded ${usernameTaken ? 'border-red-500' : ''}`} />
            {usernameTaken && (<p className="text-red-500 text-sm">
                Username is already taken.
                    </p>)}            
            
            {/* password */}
            <input type="password" placeholder="Password" value={password}
                required
                onChange={e => {
                        setPassword(e.target.value)
                        validatePassword(e.target.value);
                    }} className="p-2 border rounded" />
            {passwordWeak && (
                <p className="text-red-500 text-sm m-3">
                    Password must be at least 8 characters and contain a number.
                </p>)}
            

            {/* email */}
            <input type="email" placeholder="Email" value={email}
                required
                onChange={e => {
                    setEmail(e.target.value)
                    if (emailTaken) {
                        setEmailTaken(false);
                    }
                }} className={`p-2 border rounded ${emailTaken ? 'border-red-500' : ''}`} />
            {emailTaken && (<p className="text-red-500 text-sm">
                Email is already taken.
                    </p>
                )}


            {/* buttons */}
            <button type="submit" onClick={() => onSubmit(username, password, email)}
                className={`text-white p-2 rounded ${fetchingData ? "bg-green-400" : "bg-green-500 hover:bg-green-600"}`}>
                {fetchingData ? "Creating account..." : "Create Account"}
            </button>
            <button type="button" onClick={() => onSwitch()}
                className="text-sm text-gray-600 hover:underline mx-auto">
                Back
            </button>
        </>
    );
}