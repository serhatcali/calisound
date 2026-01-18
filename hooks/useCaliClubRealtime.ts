'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/cali-club-supabase'
import { useCaliClubStore, Character, ChatMessage } from '@/stores/cali-club-store'

export function useCaliClubRealtime() {
  const { 
    setCharacters, 
    addCharacter, 
    updateCharacter, 
    removeCharacter, 
    addMessage, 
    setMessages,
    setCurrentSong,
    setIsPlaying,
    setOnlineUsersCount,
    songs
  } = useCaliClubStore()

  useEffect(() => {
    // Subscribe to characters changes
    const charactersChannel = supabase
      .channel('cali-club-characters')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cali_club_characters',
          // Remove filter to listen to all changes (including is_active=false updates)
        },
        (payload) => {
          console.log('Character change:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT') {
            addCharacter(payload.new as Character)
            // Update online count
            const { characters: currentChars } = useCaliClubStore.getState()
            setOnlineUsersCount(currentChars.length + 1)
          } else if (payload.eventType === 'UPDATE') {
            const updatedCharacter = payload.new as Character
            // If character is set to inactive, remove it from the scene
            if (updatedCharacter.is_active === false) {
              removeCharacter(updatedCharacter.id)
              // Update online count
              const { characters: currentChars } = useCaliClubStore.getState()
              setOnlineUsersCount(currentChars.length - 1)
            } else {
              updateCharacter(updatedCharacter.id, updatedCharacter as Partial<Character>)
            }
          } else if (payload.eventType === 'DELETE') {
            removeCharacter((payload.old as Character).id)
            // Update online count
            const { characters: currentChars } = useCaliClubStore.getState()
            setOnlineUsersCount(currentChars.length)
          }
        }
      )
      .subscribe()

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel('cali-club-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cali_club_messages',
        },
        (payload) => {
          console.log('New message:', payload.new)
          addMessage(payload.new as ChatMessage)
        }
      )
      .subscribe()

    // Subscribe to concert state changes (song synchronization)
    const stateChannel = supabase
      .channel('cali-club-state')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cali_club_state',
          filter: 'id=eq.main',
        },
        (payload) => {
          console.log('State change:', payload.new)
          const state = payload.new as any
          
          // Update current song
          if (state.current_song_id) {
            const song = songs.find(s => s.id === state.current_song_id)
            if (song) {
              setCurrentSong(song)
            } else {
              // Song not found in local store, fetch it
              supabase
                .from('cali_club_songs')
                .select('*')
                .eq('id', state.current_song_id)
                .single()
                .then(({ data, error }) => {
                  if (!error && data) {
                    setCurrentSong({
                      id: data.id,
                      title: data.title,
                      artist: data.artist,
                      album: data.album || undefined,
                      apple_music_id: data.apple_music_id,
                      artwork_url: data.artwork_url || undefined,
                      duration: data.duration || undefined,
                    })
                  }
                })
            }
          } else {
            setCurrentSong(null)
          }
          
          // Update playing state
          if (state.is_playing !== undefined) {
            setIsPlaying(state.is_playing)
          }
        }
      )
      .subscribe()

    // Initial load
    const loadInitialData = async () => {
      try {
        // Load characters
        const { data: characters, error: charsError } = await supabase
          .from('cali_club_characters')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (!charsError && characters) {
          setCharacters(characters as Character[])
          // Update online users count
          setOnlineUsersCount(characters.length)
        }

        // Load recent messages
        const { data: messages, error: msgsError } = await supabase
          .from('cali_club_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (!msgsError && messages) {
          setMessages((messages.reverse() as ChatMessage[]).map((msg) => ({
            ...msg,
            id: msg.id || `msg_${Date.now()}`,
          })))
        }

        // Load current concert state
        const { data: state, error: stateError } = await supabase
          .from('cali_club_state')
          .select('*')
          .eq('id', 'main')
          .single()

        if (!stateError && state) {
          // Set current song if exists
          if (state.current_song_id) {
            const { data: songData } = await supabase
              .from('cali_club_songs')
              .select('*')
              .eq('id', state.current_song_id)
              .single()

            if (songData) {
              setCurrentSong({
                id: songData.id,
                title: songData.title,
                artist: songData.artist,
                album: songData.album || undefined,
                apple_music_id: songData.apple_music_id,
                artwork_url: songData.artwork_url || undefined,
                duration: songData.duration || undefined,
              })
            }
          }
          
          // Set playing state
          setIsPlaying(state.is_playing || false)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()

    // Cleanup
    return () => {
      charactersChannel.unsubscribe()
      messagesChannel.unsubscribe()
      stateChannel.unsubscribe()
    }
  }, [setCharacters, addCharacter, updateCharacter, removeCharacter, addMessage, setMessages, setCurrentSong, setIsPlaying, setOnlineUsersCount, songs])
}
