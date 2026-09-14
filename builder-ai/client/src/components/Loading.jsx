import { Loader2Icon } from 'lucide-react'

const Loading = () => {
  return (
    
        <div role="status" aria-label="Loading" className='h-screen flex items-center justify-center bg-[#E6DFD5]'>
            <Loader2Icon size={26} className="animate-spin text-[#9C5B42]"/>
        </div>
  )
}

export default Loading