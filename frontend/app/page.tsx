"use client"
import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import createUserId from "@/lib/createUserId"
import useMediaPermission from "./hooks/useMediaPermission"
import useWebsocketConnection from "./hooks/useWebsocketConnection"
export default function Home() {
  const [sessionId, setSessionId] = useState("")
  const [isInChat, setIsInChat] = useState(false)
  const [messages, setMessages] = useState<{text: string, sender: string, timestamp: number}[]>([])
  const [userId] = useState(createUserId)
const {error,stream}=useMediaPermission()

  const joinSession = () => {
    if (!sessionId.trim()) return
   
    setIsInChat(true)
  }



  if (!isInChat) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Global Chat</h1>
                <Label className="text-md text-muted-foreground mt-2 block">
                  Enter a session ID to join Chat or create one
                </Label>
              </div>
              <Input 
                placeholder="Session ID (e.g. 1225853)" 
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinSession()}
              />
              <Button onClick={joinSession} className="w-full">
                Join Chat
              </Button>
              <Button onClick={() => {
                const newId = Math.random().toString(36).substring(7)
                setSessionId(newId)
                joinSession()
              }} className="w-full">
                Create A Session ID
              </Button>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <p className="text-sm text-muted-foreground">Your User ID: {userId}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold">Session: {sessionId}</h1>
          <p className="text-sm text-muted-foreground">User: {userId}</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setIsInChat(false)
              setMessages([])
            }}
          >
            Leave
          </Button>
        </div>
      </div>

     
    </div>
  )
}