import Post from "../Post"
import { useEffect, useState } from 'react';

export default function IndexPage(){
    const [posts, setPosts] = useState([]);
    useEffect(()=>{
        fetch(import.meta.env.VITE_API_URL+'/post').then(response=>{
            response.json().then(posts=>{
                // console.log(posts);
                setPosts(posts);
            })
        })
    }, []);
    return(
        <>
            {posts.length>0 && posts.map(post=>(
                <Post {...post}/>
            ))}
        </>
    )
}