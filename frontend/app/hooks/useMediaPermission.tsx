import { useEffect, useState } from 'react';
import useWebsocketConnection from './useWebsocketConnection';

const useMediaPermission = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {wsRef}=useWebsocketConnection()

  useEffect(() => {
    let peerConnection: RTCPeerConnection | null = null;
    let localStream: MediaStream | null = null;

    async function initialWebRtc() {
      try {
        console.log("📹 Step 1: Requesting camera/microphone permission...");
        
        // 1. Get User Media
        localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });
        
        console.log("✅ Camera and microphone access granted");
        setStream(localStream);
        
        // 2. Create Peer Connection
        console.log("🔌 Step 2: Creating RTCPeerConnection...");
        peerConnection = new RTCPeerConnection({
          iceServers: [
            {
              urls: ['stun:stun.l.google.com:19302']
            }
          ],
          iceCandidatePoolSize: 10
        });
        console.log("✅ PeerConnection created");
        const dataChannel = peerConnection.createDataChannel("server-channel");
        console.log("data channel created" ,dataChannel)

        // 3. Add tracks
        console.log("🎵 Step 3: Adding media tracks to PeerConnection...");
        localStream.getTracks().forEach((track) => {
          console.log(`  - Adding ${track.kind} track (${track.label})`);
          peerConnection?.addTrack(track, localStream!);
        });
        console.log(`✅ Added ${localStream.getTracks().length} tracks (${localStream.getAudioTracks().length} audio, ${localStream.getVideoTracks().length} video)`);
        
        // 4. Set up event listeners BEFORE creating offer
        console.log("👂 Step 4: Setting up event listeners...");
        
        // ICE Candidate event (SINGLE listener)
        peerConnection.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            const candidate = event.candidate;
            const interfaceType = guessInterface(candidate.address as string);
            console.log(`🧊 ICE Candidate [${candidate.type}]: ${candidate.address}:${candidate.port} (${candidate.protocol}) - ${interfaceType}`);
          } else {
            console.log("🧊 ICE candidate gathering completed (null candidate sent)");
          }
        });
        
        // ICE Gathering State Change
        peerConnection.addEventListener('icegatheringstatechange', () => {
          console.log(`📡 ICE Gathering State: ${peerConnection?.iceGatheringState}`);
          
          if (peerConnection?.iceGatheringState === 'complete') {
            console.log("✅ All ICE candidates gathered! Ready to send offer to signaling server");
            console.log("📄 Final SDP Offer:", peerConnection.localDescription?.sdp);
          }
        });
        
        // ICE Connection State Change
        peerConnection.addEventListener('iceconnectionstatechange', () => {
          const state = peerConnection?.iceConnectionState;
          console.log(`🔗 ICE Connection State: ${state}`);
          
          if (state === 'connected') {
            console.log("🎉 SUCCESS! Peer-to-peer connection established!");
          } else if (state === 'failed') {
            console.log("❌ ICE connection failed - cannot reach remote peer");
          } else if (state === 'disconnected') {
            console.log("⚠️ ICE connection lost");
          }
        });
        
        // Connection State Change
        peerConnection.addEventListener('connectionstatechange', () => {
          console.log(`🌐 Connection State: ${peerConnection?.connectionState}`);
        });
        
        // Signaling State Change
        peerConnection.addEventListener('signalingstatechange', () => {
          console.log(`🔄 Signaling State: ${peerConnection?.signalingState}`);
        });
        
        // 5. Create Offer
        console.log("📝 Step 5: Creating SDP offer...");
        const offer = await peerConnection.createOffer();
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            data: offer
          }));
        }
       
        console.log("✅ SDP offer created successfully");
        
        // 6. Set Local Description
        console.log("📤 Step 6: Setting local description (triggers ICE gathering)...");
        await peerConnection.setLocalDescription(offer);
        console.log("✅ Local description set - ICE gathering started automatically");
        
        // Log statistics
        console.log("📊 Step 7: Gathering connection statistics...");
        const stats = await peerConnection.getStats();
        stats.forEach(stat => {
          if (stat.type === 'candidate-pair') {
            console.log(`  - Candidate pair: ${stat.state}`);
          }
        });
        
        console.log("\n🎯 WebRTC initialization complete!");
        console.log("📋 Summary:");
        console.log(`  - Stream active: ${!!localStream}`);
        console.log(`  - PeerConnection state: ${peerConnection.signalingState}`);
        console.log(`  - ICE gathering: ${peerConnection.iceGatheringState}`);
        console.log(`  - SDP offer ready: ${!!peerConnection.localDescription}`);
        console.log("\n💡 Next steps: Send this SDP offer to remote peer via signaling server\n");
        
      } catch (err: any) {
        console.error("❌ WebRTC Error:", err);
        setError(err.message || "Failed to initialize WebRTC");
      }
    }

    initialWebRtc();

    // Cleanup Function
    return () => {
      console.log("🧹 Cleaning up WebRTC resources...");
      
      if (localStream) {
        console.log("  - Stopping media tracks");
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnection) {
        console.log("  - Closing peer connection");
        peerConnection.close();
      }
      
      console.log("✅ Cleanup complete");
    };
  }, []);

  return { stream, error };
};

// Helper function for interface detection
function guessInterface(ip: string): string {
  if (!ip) return 'Unknown';
  if (ip === '127.0.0.1') return '🏠 Localhost';
  if (ip.startsWith('192.168.')) return '🏠 Local WiFi/Ethernet';
  if (ip.startsWith('10.')) return '💼 Corporate Network';
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1]);
    if (second >= 16 && second <= 31) return '🔧 Private Network (Docker/VPN)';
  }
  if (ip.includes(':')) return '🌐 IPv6';
  if (ip.match(/^\d{1,3}\./)) return '🌍 Public/External IP';
  return '❓ Unknown';
}

export default useMediaPermission;