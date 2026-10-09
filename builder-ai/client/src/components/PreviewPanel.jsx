import React, { useEffect, useMemo, useRef, useState } from 'react'
import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack} from '@codesandbox/sandpack-react'
import { detectDependencies } from '../utils/sandpackUtils';
import { useAppContext } from '../context/AppContext';
import SandpackErrorMonitor from './SandpackErrorMonitor';
import { Monitor, Tablet, Smartphone, RotateCw, AlertTriangle, Sparkles, Loader2, X } from 'lucide-react';

// Watches for file edits inside Sandpack editor and saves changes to DB & live state
function SandpackFileWatcher({ onLiveFilesChange }){
    const { sandpack } = useSandpack();
    const { files } = sandpack;
    const { activeProject, updateProjectFiles } = useAppContext()

    const activeProjectRef = useRef(activeProject)

    useEffect(()=>{
        activeProjectRef.current = activeProject;
    },[activeProject])

    useEffect(()=>{
       const project =  activeProjectRef.current;
       if (!project) return;
        const updatedFiles = {};
        let hasChanges = false;

        for (const [path, fileObj] of Object.entries(files)) {
            const fileCode = fileObj.code;
            updatedFiles[path] = fileCode;
            const originalContent = typeof project.files[path] === "string" ? project.files[path] : project.files[path]?.content;
            if(originalContent !== undefined && originalContent !== fileCode){
                hasChanges = true;
            }
        }

        // Sync live files to parent
        onLiveFilesChange(updatedFiles)
        if(hasChanges){
            updateProjectFiles(updatedFiles)
        }

    },[files])
    return null;
}

const PreviewPanel = ({project, activeFile, showCode}) => {

    const { handleChat, chatLoading } = useAppContext();
    const [showErrorOverlay, setShowErrorOverlay] = useState(true)
    const [activeError, setActiveError] = useState(null)
    const [device, setDevice] = useState("desktop");
    const [orientation, setOrientation] = useState("portrait");

    const handleAutoFix = () => {
        if (!activeError) return;
        const errorMsg = activeError.message || "Unknown error";
        const errorPath = activeError.path ? ` in ${activeError.path}` : "";
        const prompt = `Please fix this compilation/runtime error${errorPath}: "${errorMsg}". Ensure all component imports, exports, and React hooks are properly written and valid.`;
        handleChat(prompt);
    };

    const dimensions = useMemo(() => {
        if (device === "desktop") {
            return { width: "100%", height: "100%", label: "Responsive" };
        }
        if (device === "tablet") {
            return orientation === "portrait"
                ? { width: "768px", height: "92%", label: "768 × 1024" }
                : { width: "1024px", height: "680px", label: "1024 × 768" };
        }
        return orientation === "portrait"
            ? { width: "375px", height: "720px", label: "375 × 740" }
            : { width: "667px", height: "375px", label: "667 × 375" };
    }, [device, orientation]);

   // Keep local state of files that updates as user types
   const [liveFiles, setLiveFiles] = useState(project.files);
   const [prevProjectKey, setPrevProjectKey] = useState(`${project._id}-${project.version}`)

   const currentKey = `${project._id}-${project.version}`;
   if(prevProjectKey !== currentKey){
    setPrevProjectKey(currentKey);
    setLiveFiles(project.files);
   }

   const handleLiveFilesChange = (newFiles)=>{
    setLiveFiles((prev)=>{
        let changed = false;
        for (const [p, code] of Object.entries(newFiles)) {
            if (prev[p] !== code){
                changed = true;
                break;
            }
        }
        return changed ? newFiles : prev;
    })
   }


    // Convert liveFiles to Sandpack format
   const sandpackFiles = useMemo(()=>{
    const spFiles = {};
    for (const [path, content] of Object.entries(liveFiles)) {
        const fileCode = typeof content === "string" ? content : content?.content || "";
        spFiles[path] = {
            code: fileCode,
            active: path === activeFile,
        }
    }
    return spFiles;
   },[liveFiles, activeFile])

// Detect dependencies from import statements using liveFiles
const dependencies = useMemo(()=>{
    return detectDependencies(liveFiles)
},[liveFiles])

  return (
    <div className="h-full w-full">
        <SandpackProvider key={project._id} template='react' 
        files={sandpackFiles} 
        customSetup={{dependencies}} 
        options={{
            externalResources: [
                "https://cdn.tailwindcss.com",
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
            ],
            classes: {
                "sp-wrapper": "sp-wrapper",
                "sp-layout": "sp-layout",
                "sp-preview": "sp-preview",
            },
            logLevel: 0,
        }} 
        theme={{
            colors: {
                surface1: "#111116",
                surface2: "#18181e",
                surface3: "#1f1f28",
                clickable: "#7a7a96",
                base: "#e2e2ee",
                disabled: "#46465e",
                hover: "#e2e2ee",
                accent: "#8b83f7",
                error: "#f87171",
                errorSurface: "#1c1010",
            },
            syntax: {
                keyword:     "#8b83f7",
                property:    "#67e8f9",
                plain:       "#e2e2ee",
                static:      "#fda4af",
                string:      "#86efac",
                definition:  "#c4b5fd",
                punctuation: "#7a7a96",
                tag:         "#86efac",
                comment: { color: "#46465e", fontStyle: "italic" },
            },
            font: {
                body:       "'Inter', system-ui, -apple-system, sans-serif",
                mono:       "'Geist Mono', ui-monospace, monospace",
                size:       "13px",
                lineHeight: "1.6",
            }
        }}>

            <SandpackFileWatcher onLiveFilesChange={handleLiveFilesChange}/>
            <SandpackErrorMonitor onErrorChange={setShowErrorOverlay} onActiveError={setActiveError}/>
            <SandpackLayout
            style={{
                height: "100%",
                border: "none",
                borderRadius: 0,
                background: "transparent",
            }}>
                {showCode && (
                    <SandpackCodeEditor
                        showTabs
                        showLineNumbers
                        showInlineErrors
                        wrapContent
                        style={{
                            height: "100%",
                            flex: 1,
                            minWidth: 0,
                            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                    />
                )}

                {/* Live Preview Container with Device Controls */}
                <div
                    className="flex flex-col h-full overflow-hidden bg-[#07090e] relative"
                    style={{ flex: showCode ? 1.2 : 1, minWidth: 0 }}
                >
                    {/* Device Toolbar */}
                    <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b select-none"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                        {/* Device Selector */}
                        <div className="flex items-center gap-0.5 p-0.5 rounded-lg border"
                            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                            {[{id:'desktop',icon:<Monitor size={12}/>,label:'Desktop'},{id:'tablet',icon:<Tablet size={12}/>,label:'Tablet'},{id:'mobile',icon:<Smartphone size={12}/>,label:'Mobile'}].map(({id,icon,label}) => (
                                <button key={id} type="button" onClick={() => setDevice(id)} title={label}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
                                    style={{
                                        background: device === id ? 'var(--accent-dim)' : 'transparent',
                                        color: device === id ? 'var(--accent)' : 'var(--text-3)',
                                        border: device === id ? '1px solid rgba(139,131,247,0.25)' : '1px solid transparent',
                                    }}>
                                    {icon}
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Orientation + Resolution */}
                        <div className="flex items-center gap-2">
                            {device !== "desktop" && (
                                <button type="button"
                                    onClick={() => setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))}
                                    title="Toggle Orientation"
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium cursor-pointer transition border"
                                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                                    <RotateCw size={11} className={orientation === "landscape" ? "rotate-90 transition-transform" : "transition-transform"} />
                                    <span className="capitalize">{orientation}</span>
                                </button>
                            )}
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded border"
                                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }}>
                                {dimensions.label}
                            </span>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className={`flex-1 w-full h-full overflow-auto flex items-center justify-center ${
                        device === "desktop" ? "p-0" : "p-4 sm:p-8"
                    }`} style={device !== 'desktop' ? { background: 'var(--bg)' } : {}}>
                        {device === "desktop" ? (
                            <div className="w-full h-full">
                                <SandpackPreview
                                    showNavigator={false}
                                    showRefreshButton
                                    showOpenInCodeSandbox={false}
                                    showSandpackErrorOverlay={showErrorOverlay}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            </div>
                        ) : device === "tablet" ? (
                            <div
                                style={{
                                    width: dimensions.width,
                                    height: dimensions.height,
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                }}
                                className="relative rounded-2xl border-4 border-zinc-700/80 shadow-2xl overflow-hidden bg-black ring-1 ring-white/15 transition-all duration-300 flex flex-col shrink-0"
                            >
                                {/* Tablet Camera */}
                                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 size-2 bg-zinc-800 rounded-full z-20 pointer-events-none ring-1 ring-white/20" />

                                <div className="flex-1 w-full h-full overflow-hidden">
                                    <SandpackPreview
                                        showNavigator={false}
                                        showRefreshButton
                                        showOpenInCodeSandbox={false}
                                        showSandpackErrorOverlay={showErrorOverlay}
                                        style={{ height: "100%", width: "100%" }}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Mobile Phone Frame */
                            <div
                                style={{
                                    width: dimensions.width,
                                    height: dimensions.height,
                                    maxWidth: "100%",
                                    maxHeight: "96%",
                                }}
                                className="relative rounded-[36px] border-4 border-zinc-700/80 shadow-2xl overflow-hidden bg-black ring-1 ring-white/15 transition-all duration-300 flex flex-col shrink-0"
                            >
                                {/* Dynamic Island */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 pointer-events-none flex items-center justify-center ring-1 ring-white/10">
                                    <div className="size-2 rounded-full bg-zinc-800 ml-auto mr-2" />
                                </div>

                                <div className="flex-1 w-full h-full overflow-hidden">
                                    <SandpackPreview
                                        showNavigator={false}
                                        showRefreshButton
                                        showOpenInCodeSandbox={false}
                                        showSandpackErrorOverlay={showErrorOverlay}
                                        style={{ height: "100%", width: "100%" }}
                                    />
                                </div>

                                {/* Home Bar Indicator */}
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-20 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {/* Auto-Fix Floating Banner */}
                    {activeError && (
                        <div className="absolute bottom-4 left-4 right-4 max-w-lg mx-auto rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 z-30 border"
                            style={{ background: 'var(--surface)', borderColor: 'rgba(248,113,113,0.25)' }}>
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <AlertTriangle className="size-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#fca5a5' }}>
                                        <span>Compile Error</span>
                                        {activeError.path && (
                                            <span className="font-mono text-[10px] truncate max-w-44" style={{ color: 'var(--text-3)' }}>
                                                ({activeError.path})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] font-mono truncate mt-0.5" style={{ color: 'var(--text-2)' }}>
                                        {activeError.message || "Error rendering component"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button type="button" onClick={handleAutoFix} disabled={chatLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                                    style={{ background: 'var(--accent)', color: '#fff' }}>
                                    {chatLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                                    Auto-Fix
                                </button>
                                <button type="button" onClick={() => setActiveError(null)}
                                    className="p-1 rounded-md cursor-pointer transition"
                                    style={{ color: 'var(--text-3)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SandpackLayout>



        </SandpackProvider>

    </div>
  )
}

export default PreviewPanel