import { useState } from "react";
import { useAuth } from '../data/providers/AuthProvider';
import { LoginForm } from "./LoginForm";
import { CreateAccountForm } from "./CreateAccountForm";

function LogInBox() {
    const [mode, setMode] = useState<null | "login" | "create">(null); // can either be null, "login" or "create"
    const { login, register, fetchingData, passwordWeak, loginSuccessful, resetErrors, validatePassword, emailTaken, usernameTaken, setUsernameTaken, setEmailTaken } = useAuth(); // own hook to handle auth logic
    return (
        <div className="login-box border-2 rounded-lg shadow-lg p-5 w-full max-w-md mx-auto">
            <h2>{mode === "login" ? "Log In" : mode === "create" 
                                                        ? "Create Account" :
                                                        "Log In or Create Account"}</h2>

            
            <form className="flex flex-col gap-4 mt-4" onSubmit={e => e.preventDefault()}> {/*onSubmit handler now prevents redirections*/}
                {mode === null && (
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setMode("login")}
                            className="bg-blue-500 p-2 rounded w-1/2 hover:bg-blue-600">
                            Log In
                        </button>
                        <button type="button" onClick={() => setMode("create")}
                            className="bg-green-400 p-2 rounded w-1/2 hover:bg-green-500">
                            Create Account
                        </button>
                    </div>
                )}
                {mode === "login" && (
                    <LoginForm
                        onSubmit={login}
                        onSwitch={() => {
                            setMode(null);
                            resetErrors();
                        } }
                        fetchingPassword={fetchingData}
                        validatePassword={validatePassword}
                        passwordWeak={passwordWeak}
                        loginSuccessful={loginSuccessful} errorMessage={""}                         
                         />
                )}
                {mode === "create" && (
                    <CreateAccountForm 
                        onSubmit={register} 
                        onSwitch={() => {
                            setMode(null)
                            resetErrors()
                        }} 
                        fetchingData={fetchingData}
                        passwordWeak={passwordWeak}
                        validatePassword={validatePassword}
                        emailTaken={emailTaken}
                        usernameTaken={usernameTaken}
                        setUsernameTaken={setUsernameTaken}
                        setEmailTaken={setEmailTaken}
                    />
                )}
            </form>
        </div>
    );
}

export default LogInBox;