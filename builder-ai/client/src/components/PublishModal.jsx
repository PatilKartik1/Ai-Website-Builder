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
    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-[#DCD3C7] border border-[#C0B4A5] shadow-lg rounded-xl max-w-md w-full p-6 mx-4 relative">
            <button onClick={onClose} className='absolute top-4 right-4 text-[#635B54] hover:text-[#24211E] cursor-pointer'>
                <XIcon size={16}/>
            </button>

             <div className="mb-6">
                <h3 className="text-lg font-medium text-[#24211E] mb-1">Your website is live!</h3>
                <p className="text-sm text-[#635B54]">Anyone with the link below can view your published site.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-semibold text-[#635B54] uppercase tracking-widest mb-1.5">
                         Published Link
                    </label>
                    <input type="text" readOnly value={publishUrl} className="w-full px-0 py-2 border-b border-[#C0B4A5] text-sm text-[#24211E] bg-transparent outline-none"/>
                </div>
                <div className="flex gap-2 pt-2">
                    <button onClick={handleCopyLink} className='flex-1 py-2 bg-[#9C5B42] text-white text-xs font-medium hover:bg-[#854B34] cursor-pointer rounded-lg text-center'>
                        Copy Link
                    </button>
                    <button 
                    onClick={()=> window.open(publishUrl, '_blank')}
                    className='flex-1 py-2 border border-[#C0B4A5] text-[#24211E] text-xs font-medium hover:bg-[#D1C7BA] cursor-pointer rounded-lg text-center'>
                        Open Site
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PublishModal