import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { CreateAccountForm } from "./CreateAccountForm";

function LogInBox() {
    const [mode, setMode] = useState<null | "login" | "create">(null); // can either be null, "login" or "create"
    const { login, register, fetchingData, passwordWeak, validatePassword } = useAuth(); // own hook to handle auth logic

    const [usernameTaken, setUsernameTaken] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);
    const [credentialsIncorrect, setCredentialsIncorrect] = useState(false);

    return (
        <div className="login-box border-2 rounded-lg shadow-lg bg-gray-300 p-5 w-full max-w-md mx-auto">
            <h2>{mode === "login" ? "Log In" : mode === "create" 
                                                        ? "Create Account" :
                                                        "Log In or Create Account"}</h2>

            {usernameTaken && <p className="text-red-600">Username is already taken.</p>}
            {emailTaken && <p className="text-red-600">Email is already taken.</p>}
            {credentialsIncorrect && <p className="text-red-600">Username or password is incorrect.</p>}
            
            <form className="flex flex-col gap-4 mt-4">
                {mode === null && (
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setMode("login")}
                            className="bg-blue-500 text-white p-2 rounded w-1/2 hover:bg-blue-600">
                            Log In
                        </button>
                        <button type="button" onClick={() => setMode("create")}
                            className="bg-green-400 text-white p-2 rounded w-1/2 hover:bg-green-500">
                            Create Account
                        </button>
                    </div>
                )}
                {mode === "login" && (
                    <LoginForm fetchingPassword={fetchingData}
                        onSubmit={login} onSwitch={() => setMode(null)} />
                )}
                {mode === "create" && (
                    <CreateAccountForm passwordWeak={passwordWeak}
                        fetchingData={fetchingData}
                        validatePassword={validatePassword}
                        onSubmit={register} onSwitch={() => setMode(null)} />
                )}
            </form>
        </div>
    );
}

export default LogInBox;