

import { useEffect, useRef } from 'react'
const useWebsocketConnection = () => {
  const wsRef=useRef<WebSocket|null>(null)
  const message=useRef(null)
  const error=useRef(null)

    useEffect(() => {
  console.log()
 
        // ✅ Connect to port 5000 where your server is running
        wsRef.current=new WebSocket('ws://localhost:5000');
        wsRef.current.onopen = () => console.log('✅ WebSocket connected to port 5000!');
         wsRef.current.onerror = (e) => {
          console.log('❌ WebSocket failed:', e);
          error.current='❌ WebSocket failed' as any
        }
        wsRef.current.onmessage = (e) => {
          console.log('📨 Received:', e.data);
          message.current=e.data
        }
       
      }, [])
      return {wsRef,message,error}
}

export default useWebsocketConnection


