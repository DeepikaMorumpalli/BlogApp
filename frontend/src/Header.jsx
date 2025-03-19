import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "./UserContext"

export default function Header(){
    const {setUserInfo, userInfo} = useContext(UserContext);
    useEffect(()=>{
        fetch(import.meta.env.VITE_API_URL+'/profile', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' 
        }).then(response=>{
            response.json().then(userInfo=>{
                setUserInfo(userInfo);
            });
        })
    },[])
    
    function logout(){
        fetch(import.meta.env.VITE_API_URL+'/logout', {
            method: 'POST',
            credentials: 'include'
        });
        setUserInfo(null);
    }

    const username = userInfo?.username;

    return(
        <>
        <header>
            <Link to='/' className='logo'>MyBlog</Link>
            <nav>
                {username && (
                    <>
                        <Link to='/create'>Create new post</Link>
                        <a onClick={logout}>Logout</a>
                    </>
                )}
                {!username && (
                    <>
                        <Link to='/login'>Login</Link>
                        <Link to='/register'>Register</Link>
                    </>
                )}
            </nav>
        </header>
        </>
    )
}