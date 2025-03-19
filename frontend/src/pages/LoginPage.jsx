import { useContext, useState } from "react"
import { Navigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import { UserContext } from "../UserContext";

export default function LoginPage(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const {setUserInfo} = useContext(UserContext);

    async function login(e){
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_API_URL+'/login', {
            method: 'POST',
            body: JSON.stringify({username,password}),
            headers: {'Content-type':'application/json'},
            credentials: 'include',
        })
        if(response.ok){
            response.json().then(userInfo=>{
                setUserInfo(userInfo);
                setRedirect(true);
            })
        } else{
            alert('wrong credentials');
        }
    }

    if(redirect){
        return <Navigate to={'/'} /> 
    } 

    return(
        <form className='login' onSubmit={login}>
            <h1>Login</h1>
            <TextField label="Username" className="text-field"
            value={username} onChange={e=>setUsername(e.target.value)} />
            <br></br> <br></br>
            <TextField label="Password" type="password" className="text-field"
            value={password} onChange={e=>setPassword(e.target.value)} />
            <br></br> <br></br>
            <button>Login</button>
        </form>
    )
}