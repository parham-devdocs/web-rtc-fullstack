

import useMediaPermission from '@/app/hooks/useMediaPermission'
import React, { useEffect, useRef } from 'react'

const Video = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const { error,stream } = useMediaPermission()
  useEffect(()=>{
    console.log(videoRef.current)
    console.log(stream)
    if (stream && videoRef.current) {
      videoRef.current.srcObject=stream
      console.log("stream set to srcObject")
    }
  },[videoRef,stream])
  return (
    <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
    <video 
      className="w-full h-full" 
      ref={videoRef}
      autoPlay
      playsInline
      muted
    />
  
   
    <div>
  
  </div>
    {error && (
      <p className="text-red-500 text-sm">{error}</p>
    )}
  </div>  )
}

export default Video