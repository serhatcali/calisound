'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface MediaFile {
  name: string
  id: string
  created_at: string
  updated_at: string
  metadata: {
    size: number
    mimetype: string
  }
  publicUrl: string
}

export function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error

      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(file.name)

          return {
            name: file.name,
            id: file.id,
            created_at: file.created_at,
            updated_at: file.updated_at,
            metadata: file.metadata,
            publicUrl: urlData.publicUrl,
          }
        })
      )

      setFiles(filesWithUrls)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Reload files
      await loadFiles()
      alert('File uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading file:', error)
      alert(`Error uploading file: ${error.message}`)
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([fileName])

      if (error) throw error

      await loadFiles()
      alert('File deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting file:', error)
      alert(`Error deleting file: ${error.message}`)
    }
  }

  const handleSelect = (url: string) => {
    setSelectedFile(url)
    if (onSelect) {
      onSelect(url)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Image</h3>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <div className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
              {uploading ? (
                <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </span>
              )}
            </div>
          </label>
          <label htmlFor="file-upload">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={uploading}
              className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </motion.button>
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Max file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
        </p>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-2 ${
                selectedFile === file.publicUrl
                  ? 'border-orange-500'
                  : 'border-gray-200 dark:border-gray-800'
              } cursor-pointer hover:border-orange-500 transition-all`}
              onClick={() => handleSelect(file.publicUrl)}
            >
              <div className="aspect-square relative">
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    {onSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(file.publicUrl)
                        }}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-semibold"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(file.name)
                      }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatFileSize(file.metadata?.size || 0)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
