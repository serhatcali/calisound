'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { ChatIcon, SendIcon, OnlineIcon, MessageIcon, UserIcon } from './Icons'
import { showToast } from './Toast'

export function ChatPanel() {
  const { messages, addMessage, currentCharacter, onlineUsersCount } = useCaliClubStore()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)
  const lastMessageCount = useRef(0)

  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current) return
    
    const container = messagesContainerRef.current
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    
    // Only scroll if user is near bottom or if forced (new message sent)
    if (force || isNearBottom) {
      // Use scrollTop instead of scrollIntoView to prevent page scroll
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    // On initial load, don't scroll at all
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      lastMessageCount.current = messages.length
      // Ensure container stays at top on initial load
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0
      }
      return
    }

    // Only scroll if new messages were added (not on page refresh)
    if (messages.length > lastMessageCount.current) {
      scrollToBottom(true)
      lastMessageCount.current = messages.length
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !currentCharacter || isSending) {
      return
    }

    setIsSending(true)

    try {
      const messageData = {
        session_id: currentCharacter.session_id,
        character_name: currentCharacter.name,
        message: input.trim(),
      }

      const response = await fetch('/api/cali-club/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      // Message will be added via realtime subscription
      setInput('')
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error: any) {
      console.error('Error sending message:', error)
      showToast(error.message || 'Error sending message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="h-full lg:h-auto lg:flex-1 flex flex-col bg-black/90 backdrop-blur-xl min-h-[300px] lg:min-h-0">
      <div className="p-5 border-b-2 border-gray-900/50 flex-shrink-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/8 to-yellow-600/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-500/3 rounded-full blur-3xl" />
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur-sm">
              <ChatIcon className="text-yellow-400" size={16} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chat</h3>
              <p className="text-xs text-gray-500 font-medium">Live Messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full border-2 border-yellow-500/50">
            <OnlineIcon className="text-green-500" size={8} />
            <span className="text-xs text-yellow-400 font-bold">
              {onlineUsersCount} online
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 font-medium">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </p>
        </div>
      </div>

      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 smooth-scroll"
        onScroll={(e) => {
          // Prevent scroll from bubbling to page
          e.stopPropagation()
        }}
        role="log"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <MessageIcon className="text-gray-600 mx-auto mb-3" size={48} />
            <p className="font-medium">No messages yet</p>
            <p className="text-xs mt-1">Be the first to send a message!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl rounded-xl p-3.5 border-2 border-gray-900/50 hover:border-gray-800 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xs font-bold text-yellow-400 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {msg.character_name}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-100 leading-relaxed">{msg.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentCharacter ? (
        <div className="p-4 border-t-2 border-gray-900/50 flex-shrink-0 bg-gradient-to-b from-black/80 to-black/40">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-white rounded-xl border-2 border-gray-900/50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none text-sm shadow-lg transition-all focus-visible-ring"
              maxLength={200}
              disabled={isSending}
              aria-label="Chat message input"
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 transition-all flex items-center justify-center ring-1 ring-yellow-400/20 border border-yellow-400/10"
            >
              {isSending ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              ) : (
                <SendIcon size={18} />
              )}
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t-2 border-gray-900/50 text-center text-gray-400 text-sm flex-shrink-0 bg-gradient-to-b from-black/80 to-black/40">
          <div className="flex items-center justify-center gap-2">
            <UserIcon className="text-gray-500" size={16} />
            <span className="font-medium">Create a character first to chat</span>
          </div>
        </div>
      )}
    </div>
  )
}
