import { ArrowLeftIcon, Code2Icon, DownloadIcon, ExternalLinkIcon, EyeIcon, GlobeIcon, Loader2Icon } from 'lucide-react'
import React from 'react'

const BuilderHeader = ({
    projectName,
    version,
    showCode,
    publishing,
    onToggleShowCode,
    onOpenPreview,
    onPublish,
    onDownload,
    onBack,
    onLogout,
}) => {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-[#C0B4A5] bg-[#DCD3C7]">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className='p-1.5 rounded-md text-[#635B54] hover:text-[#24211E] hover:bg-[#D1C7BA] cursor-pointer'>
                <ArrowLeftIcon size={16} />
            </button>
            <img src="/logo.svg" alt="BuilderAI" className="size-5" />
            <span className="text-sm font-semibold truncate max-w-38 md:max-w-50">{projectName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D1C7BA] text-[#635B54] font-medium">v{version}</span>
        </div>

        <div className="flex items-center gap-1.5">
            <button onClick={onToggleShowCode}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#C0B4A5] text-[#24211E] hover:bg-[#D1C7BA] text-xs font-medium rounded-lg cursor-pointer bg-[#E6DFD5] ${showCode ? "bg-[#D1C7BA] font-semibold border-[#9C5B42]" : ""}`}>
                {showCode ? (
                    <>
                    <EyeIcon size={13}/> Preview
                    </>
                ) : (
                    <>
                    <Code2Icon size={13}/> Code
                    </>
                )}
            </button>
            <button onClick={onOpenPreview}
            className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#C0B4A5] text-[#24211E] hover:bg-[#D1C7BA] text-xs font-medium rounded-lg cursor-pointer bg-[#E6DFD5]'>
                <ExternalLinkIcon size={13} /> Open Preview
            </button>

            <button onClick={onPublish} disabled={publishing} 
            className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#C0B4A5] text-[#24211E] hover:bg-[#D1C7BA] text-xs font-medium rounded-lg cursor-pointer bg-[#E6DFD5]'>
                {publishing ? <Loader2Icon size={13} className="animate-spin"/> : <GlobeIcon size={13}/>} Publish
            </button>

            <button onClick={onDownload}
            className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#C0B4A5] text-[#24211E] hover:bg-[#D1C7BA] text-xs font-medium rounded-lg cursor-pointer bg-[#E6DFD5]'>
                <DownloadIcon size={13} /> Export
            </button>

            <button onClick={onLogout}
            className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#C0B4A5] text-[#24211E] hover:bg-[#D1C7BA] text-xs font-medium rounded-lg cursor-pointer bg-[#E6DFD5]'>
                Sign out
            </button>
        </div>
    </header>
  )
}

export default BuilderHeader