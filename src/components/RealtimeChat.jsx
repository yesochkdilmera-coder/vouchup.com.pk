import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function RealtimeChat({ roomId }) {
    const [messages, setMessages] = useState([])

    // Realtime subscription setup
    useEffect(() => {
        // 1. Set up the subscription
        const channel = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                // Handle new message
                console.log('Change received!', payload)
                setMessages((current) => [...current, payload.new])
            })
            .subscribe()

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId])

    // Function to send message (client-side insert)
    const sendMessage = async (text) => {
        const { error } = await supabase
            .from('messages')
            .insert({ content: text, room_id: roomId })

        if (error) console.error('Error sending message:', error)
    }

    return (
        <div className='chat-container'>
            <h3>Realtime Chat ({roomId})</h3>
            <div className='message-list'>
                {messages.map((msg) => (
                    <div key={msg.id} className='message'>
                        <p>{msg.content}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => sendMessage('Hello World!')}>Send "Hello World!"</button>
        </div>
    )
}
