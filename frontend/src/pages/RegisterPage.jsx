import { useState } from "react"
import TextField from '@mui/material/TextField';
import { Navigate } from "react-router-dom";

export default function RegisterPage(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function register(e){
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_API_URL+'/register', {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: {'Content-type': 'application/json'},
        });
        if(response.status ===200){
            setRedirect(true);
            alert('registration successful');
        }else{
            alert('registration failed');
        }
    }
    if(redirect){
        return <Navigate to={'/'} /> 
    }

    return(
        <form className='login' onSubmit={register}>
            <h1>Register</h1>
            <TextField label="Username" className="text-field"
            value={username} onChange={e=>setUsername(e.target.value)} />
            <br></br> <br></br>
            <TextField label="Password" type="password" className="text-field"
            value={password} onChange={e=>setPassword(e.target.value)} />
            <br></br> <br></br>
            <button>Register</button>
        </form>
    )
}