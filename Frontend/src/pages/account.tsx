import LogInBox from "../components/LogInBox"
import { useAuth } from "../data/providers/AuthProvider";

function Account() {
    const { user } = useAuth();

    return (
        <div className="account-page p-5 py-10">
            <h1>Account</h1>
            {!user && <LogInBox />}
            {user && <UserPage />}
            
        </div>
    )
}

function UserPage () {
    const { user } = useAuth();
    return (
        <div>
            <p>Hello monkey {user.id} with username: {user.username}</p>
        </div>
    )
}


export default Account