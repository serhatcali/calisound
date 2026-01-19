'use client'

import { useState, useEffect } from 'react'

interface ContentItem {
  id: string
  key: string
  section: string
  label: string
  content_en: string
  content_local?: string
  content_type: 'text' | 'textarea' | 'html' | 'rich_text'
  description?: string
  updated_at: string
}

export function ContentAdminForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [editedContent, setEditedContent] = useState<Record<string, { content_en: string; content_local?: string }>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch('/api/admin/content')
      const data = await response.json()

      if (data.success) {
        setContent(data.content || [])
        // Initialize edited content
        const initial: Record<string, { content_en: string; content_local?: string }> = {}
        data.content?.forEach((item: ContentItem) => {
          initial[item.id] = {
            content_en: item.content_en,
            content_local: item.content_local || '',
          }
        })
        setEditedContent(initial)
      }
    } catch (error) {
      console.error('Error loading content:', error)
      alert('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleContentChange = (id: string, field: 'content_en' | 'content_local', value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const handleSave = async (id: string) => {
    setSaving(id)
    try {
      const contentToSave = editedContent[id]
      if (!contentToSave) return

      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          content_en: contentToSave.content_en,
          content_local: contentToSave.content_local || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local content
        setContent(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, ...data.content }
              : item
          )
        )
        alert('Content saved successfully!')
      } else {
        alert(data.error || 'Failed to save content')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content')
    } finally {
      setSaving(null)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  // Group content by section
  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, ContentItem[]>)

  // Filter by search query
  const filteredSections = Object.keys(groupedContent).filter(section => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      section.toLowerCase().includes(query) ||
      groupedContent[section].some(item =>
        item.label.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query) ||
        item.content_en.toLowerCase().includes(query)
      )
    )
  })

  const sections = ['hero', 'footer', 'newsletter', 'cookie', 'contact', 'faq', 'general']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading content...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Content by Section */}
      {sections.map(section => {
        if (!filteredSections.includes(section)) return null
        const sectionItems = groupedContent[section] || []
        if (sectionItems.length === 0) return null

        const isExpanded = expandedSections.has(section)

        return (
          <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
            >
              <h2 className="text-xl font-semibold capitalize">{section}</h2>
              <span className="text-gray-500">
                {isExpanded ? '▼' : '▶'} ({sectionItems.length})
              </span>
            </button>

            {isExpanded && (
              <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
                {sectionItems.map(item => {
                  const edited = editedContent[item.id]
                  const hasChanges =
                    edited?.content_en !== item.content_en ||
                    edited?.content_local !== (item.content_local || '')

                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                    >
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Key: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{item.key}</code>
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            English Content
                          </label>
                          {item.content_type === 'textarea' ? (
                            <textarea
                              value={edited?.content_en || ''}
                              onChange={e => handleContentChange(item.id, 'content_en', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          ) : (
                            <input
                              type="text"
                              value={edited?.content_en || ''}
                              onChange={e => handleContentChange(item.id, 'content_en', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Localized Content (Optional)
                          </label>
                          {item.content_type === 'textarea' ? (
                            <textarea
                              value={edited?.content_local || ''}
                              onChange={e => handleContentChange(item.id, 'content_local', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          ) : (
                            <input
                              type="text"
                              value={edited?.content_local || ''}
                              onChange={e => handleContentChange(item.id, 'content_local', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Last updated: {new Date(item.updated_at).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleSave(item.id)}
                            disabled={!hasChanges || saving === item.id}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              hasChanges
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {saving === item.id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {content.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No content found. Please run the database migration to create default content.
        </div>
      )}
    </div>
  )
}
