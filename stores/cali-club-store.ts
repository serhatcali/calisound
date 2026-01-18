import { create } from 'zustand'

export interface Character {
  id: string
  session_id: string
  name: string
  gender: 'male' | 'female'
  avatar_data: {
    color: string
    size?: number
    style?: string
    modelUrl?: string // GLTF/GLB model URL (from Mixamo, etc.)
    readyPlayerMeId?: string // Ready Player Me avatar ID (deprecated)
    characterModel?: string // Selected character model ID (e.g., 'character-001-male')
    customizations?: {
      hairColor?: string
      clothingColor?: string
      skinColor?: string
    }
  }
  position: { x: number; y: number; z: number }
  rotation?: { x: number; y: number; z: number }
  is_active: boolean
}

export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  apple_music_id: string
  artwork_url?: string
  duration?: number
}

export interface ChatMessage {
  id: string
  session_id: string
  character_name: string
  message: string
  created_at: string
}

interface CaliClubState {
  // Characters
  characters: Character[]
  currentCharacter: Character | null
  onlineUsersCount: number
  
  // Songs
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  
  // Chat
  messages: ChatMessage[]
  
  // Actions
  setCharacters: (characters: Character[]) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  removeCharacter: (id: string) => void
  
  setCurrentCharacter: (character: Character | null) => void
  setOnlineUsersCount: (count: number) => void
  
  setSongs: (songs: Song[]) => void
  setCurrentSong: (song: Song | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  
  addMessage: (message: ChatMessage) => void
  setMessages: (messages: ChatMessage[]) => void
}

export const useCaliClubStore = create<CaliClubState>((set) => ({
  // Initial state
  characters: [],
  currentCharacter: null,
  onlineUsersCount: 0,
  songs: [],
  currentSong: null,
  isPlaying: false,
  messages: [],

  // Character actions
  setCharacters: (characters) => set({ characters }),
  addCharacter: (character) =>
    set((state) => {
      // Avoid duplicates
      if (state.characters.find((c) => c.id === character.id)) {
        return state
      }
      return {
        characters: [...state.characters, character],
      }
    }),
  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    })),

  setCurrentCharacter: (character) => set({ currentCharacter: character }),
  setOnlineUsersCount: (count) => set({ onlineUsersCount: count }),

  // Song actions
  setSongs: (songs) => set({ songs }),
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // Chat actions
  addMessage: (message) =>
    set((state) => {
      // Avoid duplicates
      if (state.messages.find((m) => m.id === message.id)) {
        return state
      }
      return {
        messages: [...state.messages, message].slice(-100), // Keep last 100
      }
    }),
  setMessages: (messages) => set({ messages }),
}))
