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
            return { width: "100%", height: "100%", label: "100% • Responsive" };
        }
        if (device === "tablet") {
            return orientation === "portrait"
                ? { width: "768px", height: "92%", label: "768 × 1024 px" }
                : { width: "1024px", height: "680px", label: "1024 × 768 px" };
        }
        return orientation === "portrait"
            ? { width: "375px", height: "720px", label: "375 × 740 px" }
            : { width: "667px", height: "375px", label: "667 × 375 px" };
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
                surface1: "#0b0d13",
                surface2: "#12151d",
                surface3: "#1a1f2c",
                clickable: "#8b949e",
                base: "#f0f6fc",
                disabled: "#484f58",
                hover: "#f0f6fc",
                accent: "#f59e0b",
                error: "#f85149",
                errorSurface: "#211516",
            },
            syntax: {
                keyword: "#f59e0b",
                property: "#79c0ff",
                plain: "#e6edf3",
                static: "#ff7b72",
                string: "#a5d6ff",
                definition: "#d2a8ff",
                punctuation: "#8b949e",
                tag: "#7ee787",
                comment: {
                    color: "#6e7681",
                    fontStyle: "italic",
                },
            },
            font: {
                body: "'Urbanist', system-ui, -apple-system, sans-serif",
                mono: "'Geist Mono', ui-monospace, monospace",
                size: "13px",
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
                    <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b border-white/10 bg-[#090b10]/95 backdrop-blur-md text-xs select-none">
                        {/* Device Selector */}
                        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                            <button
                                type="button"
                                onClick={() => setDevice("desktop")}
                                title="Desktop (Responsive 100%)"
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                                    device === "desktop"
                                        ? "bg-amber-500/20 text-amber-300 font-semibold shadow-xs"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <Monitor size={13} />
                                <span className="hidden sm:inline">Desktop</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDevice("tablet")}
                                title="Tablet Viewport (768px)"
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                                    device === "tablet"
                                        ? "bg-amber-500/20 text-amber-300 font-semibold shadow-xs"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <Tablet size={13} />
                                <span className="hidden sm:inline">Tablet</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDevice("mobile")}
                                title="Mobile Viewport (375px)"
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                                    device === "mobile"
                                        ? "bg-amber-500/20 text-amber-300 font-semibold shadow-xs"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <Smartphone size={13} />
                                <span className="hidden sm:inline">Mobile</span>
                            </button>
                        </div>

                        {/* Orientation and Resolution Info */}
                        <div className="flex items-center gap-2">
                            {device !== "desktop" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))
                                    }
                                    title="Toggle Orientation"
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-[11px] font-medium cursor-pointer transition"
                                >
                                    <RotateCw
                                        size={12}
                                        className={orientation === "landscape" ? "rotate-90 transition-transform duration-200" : "transition-transform duration-200"}
                                    />
                                    <span className="capitalize">{orientation}</span>
                                </button>
                            )}

                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                                {dimensions.label}
                            </span>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div
                        className={`flex-1 w-full h-full overflow-auto flex items-center justify-center ${
                            device === "desktop"
                                ? "p-0 bg-transparent"
                                : "p-3 sm:p-6 bg-[#040609] bg-[radial-gradient(#181d26_1px,transparent_1px)] [background-size:16px_16px]"
                        }`}
                    >
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
                        <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto bg-[#180e10]/95 border border-red-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 z-30">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-red-200 flex items-center gap-1.5">
                                        <span>Sandbox Compile Error</span>
                                        {activeError.path && (
                                            <span className="font-mono text-[10px] text-zinc-400 font-normal truncate max-w-44">
                                                ({activeError.path})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-zinc-300 font-mono truncate mt-0.5">
                                        {activeError.message || "Error rendering React component"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleAutoFix}
                                    disabled={chatLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold rounded-lg text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {chatLoading ? (
                                        <Loader2 className="size-3.5 animate-spin text-zinc-950" />
                                    ) : (
                                        <Sparkles className="size-3.5 text-zinc-950" />
                                    )}
                                    <span>Auto-Fix with AI</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveError(null)}
                                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                                    title="Dismiss banner"
                                >
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