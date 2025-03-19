import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Navigate, useParams } from 'react-router-dom';

export default function EditPage(){
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    useEffect(()=>{
        fetch(import.meta.env.VITE_API_URL+`/post/${id}`)
            .then(response=>{
                response.json().then(postInfo=>{
                    setTitle(postInfo.title);
                    setSummary(postInfo.summary);
                    setContent(postInfo.content);
                });
            });
    },[]);

    async function updatePost(e){
        e.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if(files?.[0]){
            data.set('file', files[0]);
        }
        const response = await fetch(import.meta.env.VITE_API_URL+'/post', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });
        if(response.ok){
            setRedirect(true);
        }
        await response.json();
    }
    if(redirect){
        return <Navigate to={'/post/'+id}/>
    }
    return(
        <div>
        <form onSubmit={updatePost}>
            <input type="text" placeholder={"Title"}
                value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input type="summary" placeholder={"Summary"}
                value={summary} onChange={(e)=>setSummary(e.target.value)} />
            <input type="file" onChange={e=>setFiles(e.target.files)}></input>
            <ReactQuill value={content} onChange={newValue=>setContent(newValue)}/>
            <button style={{marginTop:'5px'}}>Update Post</button>
        </form>
        </div>
    )
}