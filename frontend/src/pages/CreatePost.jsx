import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Navigate } from 'react-router-dom';
export default function CreatePost(){
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    async function createNewPost(e){
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_API_URL+'/post', {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        await response.json();
        if(response.ok){
            setRedirect(true);
        }
    }
    if(redirect){
        return <Navigate to={'/'}/>
    }
    return(
        <div>
        <form onSubmit={createNewPost}>
            <input type="text" placeholder={"Title"}
                value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input type="summary" placeholder={"Summary"}
                value={summary} onChange={(e)=>setSummary(e.target.value)} />
            <input type="file" onChange={e=>setFiles(e.target.files)}></input>
            <ReactQuill value={content} onChange={newValue=>setContent(newValue)}/>
            <button style={{marginTop:'5px'}}>Create Post</button>
        </form>
        </div>
    )
}