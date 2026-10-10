import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";


const AppContext = createContext(undefined);

export function AppContextProvider({children}){

    const navigate = useNavigate()

     // Auth States
     const [user, setUser] = useState(null)
     const [loadingUser, setLoadingUser] = useState(true);

     // States
     const [projects, setProjects] = useState([]);
     const [loadingProjects, setLoadingProjects] = useState(true);
     const [activeProject, setActiveProject] = useState(null);
     const [loadingActiveProject, setLoadingActiveProject] = useState(true);
     const [chatLoading, setChatLoading] = useState(false);
     const [generatingProject, setGeneratingProject] = useState(false);
     const [activeFile, setActiveFile] = useState("/App.js");
     const [showCode, setShowCode] = useState(false);

      // Auth Actions
      const checkSession = async ()=>{
        try {
            const { data } = await api.get("/api/auth/me");
            setUser(data.user);
        } catch (error) {
            setUser(null)
        }finally{
            setLoadingUser(false)
        }
      }

      useEffect(()=>{
        checkSession()
      },[])

      const login = async (email, password) => {
        try {
            const { data } = await api.post("/api/auth/login", {email, password});
            setUser(data.user)
            toast.success("Welcome back!")
            navigate("/")
        } catch (err) {
            console.error("Login failed:", err);
            const errMsg = err?.response?.data?.error || (err?.request ? "Cannot reach the server. Make sure the backend is running." : "Invalid email or password");
             toast.error(errMsg);
             throw new Error(errMsg);
        }
      }

      const register = async (name, email, password) => {
        try {
            const { data } = await api.post("/api/auth/register", {name, email, password});
            setUser(data.user)
            toast.success("Account created successfully!")
            navigate("/")
        } catch (err) {
            console.error("Registration failed:", err);
            const errMsg = err?.response?.data?.error || (err?.request ? "Cannot reach the server. Make sure the backend is running." : "Registration failed");
             toast.error(errMsg);
             throw new Error(errMsg);
        }
      }

      const logout = async ()=>{
        try {
            await api.post("/api/auth/logout")
            setUser(null)
            setProjects([])
            setActiveProject(null)
            toast.success("Logged out successfully")
            navigate("/login")
        } catch (err) {
             console.error("Logout failed:", err);
             toast.error("Logout failed");
        }
      }

      // Projects Actions
      const loadProjects = async () =>{
        if(!user) return;
        try {
            const { data } = await api.get("/api/projects")
            setProjects(data)
        } catch (err) {
            console.error("Failed to list projects:", err);
            toast.error("Failed to load projects list");
        }finally{
            setLoadingProjects(false);
        }
      }

      const loadProject = useCallback(async (id, silent = false) => {
        console.log("load project");
        
        if(!user) return;
        if (!silent) setLoadingActiveProject(true)
            try {
                const { data } = await api.get(`/api/projects/${id}`)
                 setActiveProject(data);

                 // Default file selection
                 const files = Object.keys(data.files);
                 if(files.length > 0){
                    setActiveFile((prev)=>{
                        if(files.includes(prev)) return prev;
                        if(files.includes("/App.js"))  return "/App.js";
                        return files[0]
                    })
                 }
            } catch (err) {
                console.error("Failed to load project:", err);
                if(!silent){
                    toast.error("Failed to load project details");
                    navigate("/");
                }
            }finally{
                if (!silent) setLoadingActiveProject(false)
            }
      }, [user, navigate]);



       // Automatically poll active project status if generating or pending
       useEffect(()=>{
        if (!activeProject?._id || !user) return;

        const isOngoing = activeProject.status === "generating" || activeProject.status === "pending" || activeProject.status === "revising";

        if(isOngoing){
            setChatLoading(true);
            const interval = setInterval(()=>{
                loadProject(activeProject._id,true)
            },2000);
            return ()=> clearInterval(interval)
        }else{
            setChatLoading(false);
        }

       },[activeProject?._id, activeProject?.status, loadProject, user])

       const handleGenerate = useCallback(
        async (prompt) => {
            if(!user) return;

            setGeneratingProject(true);
            try {
                const { data } = await api.post("/api/projects", { prompt });
                toast.success("AI Agent is planning structure...")
                navigate(`/builder/${data._id}`);
            } catch (err) {
                console.error("Failed to generate project:", err);
                toast.error(err?.response?.data?.error || "Failed to generate project");
            }finally{
                setGeneratingProject(false);
            }

        },[navigate, user]
       )

       const handleDelete = useCallback(
        async (id) => {
            if(!user) return;

            try {
                await api.delete(`/api/projects/${id}`);
               setProjects((prev)=>prev.filter((p)=>p._id !== id))
               toast.success("Project deleted successfully")
            } catch (err) {
               console.error("Failed to delete project:", err);
                toast.error("Failed to delete project");
            }

        },[user]
       )

       // Serialize all file writes so an older autosave cannot finish after and
       // overwrite a newer save, file operation, rollback, or AI revision.
       const saveQueue = React.useRef(Promise.resolve());

       const persistFiles = useCallback((id, files) => {
            const request = saveQueue.current
                .catch(() => {})
                .then(() => api.put(`/api/projects/${id}/files`, { files }));
            saveQueue.current = request.catch(() => {});
            return request;
       }, []);

       const debouncedSave = React.useMemo(
        () => debounce(async (files, id) => {
            try {
                await persistFiles(id, files);
            } catch (err) {
                console.error("Failed to auto-save files:", err);
                toast.error(err?.response?.data?.error || "Failed to save code modifications");
            }
        }, 1000),
        [persistFiles],
       );

       const flushPendingSaves = useCallback(async () => {
            // flush() starts the pending debounced write immediately; the queue
            // then lets us wait for all writes already in progress.
            debouncedSave.flush();
            await saveQueue.current;
       }, [debouncedSave]);

       useEffect(() => {
            return () => {
                debouncedSave.flush();
            };
       }, [debouncedSave]);

       const updateProjectFiles = useCallback(
        (files) => {
            if(!activeProject || !user) return;
            debouncedSave(files, activeProject._id);
        },[activeProject, user, debouncedSave]
       );

       const handleChat = useCallback(
        async (prompt)=>{
            if(!activeProject || !user) return;
            setChatLoading(true)
            try {
                await flushPendingSaves();
                const { data } = await api.post(`/api/projects/${activeProject._id}/chat`, {prompt});
                setActiveProject(data)
                if(data.errors && data.errors.length > 0){
                     toast.error(`${data.errors.length} revision patch(es) failed`);
                }else{
                   toast.success(`Updated to version ${data.version}`); 
                }
            } catch (err) {
                console.error("Revision request failed:", err);
                toast.error(err?.response?.data?.error || "Revision request failed");
            }finally{
                setChatLoading(false)
            }
        },[activeProject, user, flushPendingSaves]
       )

       const handleRollback = useCallback(
        async (targetVersion) => {
            if(!activeProject || !user) return;
            try {
                await flushPendingSaves();
                const { data } = await api.post(`/api/projects/${activeProject._id}/rollback`, {targetVersion});
                setActiveProject(data);
                toast.success(`Restored to version ${targetVersion}`);
            } catch (err) {
                console.error("Rollback failed:", err);
                toast.error(err?.response?.data?.error || "Rollback failed");
            }
        },[activeProject, user, flushPendingSaves]
       )

       const createFile = useCallback(
        async (rawPath, customContent) => {
            if(!activeProject || !user) return false;

            let path = rawPath.trim();
            if(!path) {
                toast.error("File name cannot be empty");
                return false;
            }
            if(!path.startsWith("/")) path = "/" + path;

            if(activeProject.files && activeProject.files[path] !== undefined){
                toast.error(`File "${path}" already exists`);
                return false;
            }

            let defaultContent = customContent;
            if(defaultContent === undefined){
                if(path.endsWith(".css")){
                    defaultContent = "/* Styles */\n";
                } else if(path.endsWith(".json")){
                    defaultContent = "{\n  \n}\n";
                } else {
                    const compName = path.split("/").pop().replace(/\.[^/.]+$/, "") || "Component";
                    const safeCompName = compName.charAt(0).toUpperCase() + compName.slice(1).replace(/[^a-zA-Z0-9]/g, "");
                    defaultContent = `import React from 'react';\n\nexport default function ${safeCompName}() {\n  return (\n    <div className="p-4">\n      <h2 className="text-xl font-bold">${safeCompName}</h2>\n    </div>\n  );\n}\n`;
                }
            }

            const updatedFiles = {
                ...activeProject.files,
                [path]: defaultContent,
            };

            try {
                await flushPendingSaves();
                await persistFiles(activeProject._id, updatedFiles);
                setActiveProject(prev => ({ ...prev, files: updatedFiles }));
                setActiveFile(path);
                setShowCode(true);
                toast.success(`Created ${path}`);
                return true;
            } catch (err) {
                console.error("Failed to create file:", err);
                toast.error(err?.response?.data?.error || "Failed to create file");
                return false;
            }
        },[activeProject, user, flushPendingSaves, persistFiles]
       );

       const deleteFile = useCallback(
        async (path) => {
            if(!activeProject || !user) return false;

            if(path === "/App.js" || path === "/styles.css"){
                toast.error("Cannot delete core files (/App.js or /styles.css)");
                return false;
            }

            const { [path]: removed, ...remainingFiles } = activeProject.files || {};

            try {
                await flushPendingSaves();
                await persistFiles(activeProject._id, remainingFiles);
                setActiveProject(prev => ({ ...prev, files: remainingFiles }));
                if(activeFile === path){
                    setActiveFile(Object.keys(remainingFiles)[0] || "/App.js");
                }
                toast.success(`Deleted ${path}`);
                return true;
            } catch (err) {
                console.error("Failed to delete file:", err);
                toast.error(err?.response?.data?.error || "Failed to delete file");
                return false;
            }
        },[activeProject, user, activeFile, flushPendingSaves, persistFiles]
       );

       const renameFile = useCallback(
        async (oldPath, newRawPath) => {
            if(!activeProject || !user) return false;

            if(oldPath === "/App.js" || oldPath === "/styles.css"){
                toast.error("Cannot rename core files (/App.js or /styles.css)");
                return false;
            }

            let newPath = newRawPath.trim();
            if(!newPath){
                toast.error("File name cannot be empty");
                return false;
            }
            if(!newPath.startsWith("/")) newPath = "/" + newPath;

            if(oldPath === newPath) return true;

            if(activeProject.files && activeProject.files[newPath] !== undefined){
                toast.error(`A file named "${newPath}" already exists`);
                return false;
            }

            const fileContent = typeof activeProject.files[oldPath] === "string" 
                ? activeProject.files[oldPath] 
                : activeProject.files[oldPath]?.content || "";

            const { [oldPath]: removed, ...remainingFiles } = activeProject.files || {};
            const updatedFiles = {
                ...remainingFiles,
                [newPath]: fileContent,
            };

            try {
                await flushPendingSaves();
                await persistFiles(activeProject._id, updatedFiles);
                setActiveProject(prev => ({ ...prev, files: updatedFiles }));
                if(activeFile === oldPath){
                    setActiveFile(newPath);
                }
                toast.success(`Renamed to ${newPath}`);
                return true;
            } catch (err) {
                console.error("Failed to rename file:", err);
                toast.error(err?.response?.data?.error || "Failed to rename file");
                return false;
            }
        },[activeProject, user, activeFile, flushPendingSaves, persistFiles]
       );

    return (
        <AppContext.Provider value={{
            user,
            loadingUser,
            login,
            register,
            projects,
            loadingProjects,
            activeProject,
            loadingActiveProject,
            chatLoading,
            generatingProject,
            activeFile,
            showCode,
            setActiveFile,
            setShowCode,
            loadProjects,
            loadProject,
            handleGenerate,
            handleDelete,
            logout,
            updateProjectFiles,
            handleChat,
            handleRollback,
            createFile,
            deleteFile,
            renameFile
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext(){
    const context = useContext(AppContext);
    if(context === undefined){
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
}
