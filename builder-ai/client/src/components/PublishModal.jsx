import { XIcon } from 'lucide-react';
import React from 'react'
import toast from 'react-hot-toast';

const PublishModal = ({ publishUrl, onClose }) => {
    const handleCopyLink = () =>{
        if(!publishUrl) return;
        navigator.clipboard.writeText(publishUrl);
        toast.success("Public link copied to clipboard!")
    }
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-zinc-900/95 border border-white/15 shadow-2xl shadow-black/80 rounded-2xl max-w-md w-full p-6 mx-4 relative text-white">
            <button onClick={onClose} className='absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer transition'>
                <XIcon size={16}/>
            </button>

             <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-1">Your website is live!</h3>
                <p className="text-sm text-zinc-400">Anyone with the link below can view your published site.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                         Published Link
                    </label>
                    <input type="text" readOnly value={publishUrl} className="w-full px-0 py-2 border-b border-white/20 text-sm text-zinc-100 bg-transparent outline-none select-all"/>
                </div>
                <div className="flex gap-2.5 pt-2">
                    <button onClick={handleCopyLink} className='flex-1 py-2.5 bg-amber-600 text-white text-xs font-medium hover:bg-amber-500 cursor-pointer rounded-lg text-center transition-all shadow-md shadow-amber-600/30'>
                        Copy Link
                    </button>
                    <button 
                    onClick={()=> window.open(publishUrl, '_blank')}
                    className='flex-1 py-2.5 border border-white/15 text-zinc-200 text-xs font-medium hover:bg-white/5 cursor-pointer rounded-lg text-center transition-all'>
                        Open Site
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PublishModal