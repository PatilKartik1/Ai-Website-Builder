import { Loader2Icon } from 'lucide-react'

const Loading = () => {
  return (
    
        <div role="status" aria-label="Loading" className='h-screen flex items-center justify-center bg-transparent'>
            <Loader2Icon size={28} className="animate-spin text-amber-500"/>
        </div>
  )
}

export default Loading