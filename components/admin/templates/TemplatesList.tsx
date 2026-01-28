'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReleaseTemplate } from '@/types/release-planning'
import { PLATFORM_LABELS } from '@/types/release-planning'

interface TemplatesListProps {
  templates: ReleaseTemplate[]
}

export function TemplatesList({ templates: initialTemplates }: TemplatesListProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)

  // Get all unique tags
  const allTags = Array.from(
    new Set(templates.flatMap(t => t.tags || []))
  ).sort()

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTag = !filterTag || (template.tags || []).includes(filterTag)
    
    return matchesSearch && matchesTag
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete template')
      }
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to delete template'}`)
    }
  }

  const handleUseTemplate = async (template: ReleaseTemplate) => {
    try {
      // Increment usage count
      await fetch(`/api/admin/templates/${template.id}/use`, {
        method: 'POST',
      })

      // Navigate to new release page with template data
      const params = new URLSearchParams({
        template: template.id,
      })
      router.push(`/admin/releases/new?${params.toString()}`)
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to use template'}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Release Templates</h1>
            <p className="text-gray-400">
              Save and reuse release configurations for faster planning
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/releases/new"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              New Release
            </Link>
            <Link
              href="/admin/templates/new"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              + New Template
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {allTags.length > 0 && (
            <select
              value={filterTag || ''}
              onChange={(e) => setFilterTag(e.target.value || null)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400 mb-2">
              {templates.length === 0 
                ? 'No templates yet. Create your first template!'
                : 'No templates match your search.'}
            </p>
            {templates.length === 0 && (
              <Link
                href="/admin/templates/new"
                className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Template
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-400 mb-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                  {template.is_public && (
                    <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded">
                      Public
                    </span>
                  )}
                </div>

                {/* Template Details */}
                <div className="space-y-2 mb-4 text-sm">
                  {template.default_city && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>📍</span>
                      <span>{template.default_city}{template.default_country ? `, ${template.default_country}` : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>🌐</span>
                    <span>{template.default_local_language} ({template.default_local_language_code})</span>
                    {template.default_include_english && <span className="text-xs">+ English</span>}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>⏰</span>
                    <span>{template.default_timezone}</span>
                    {template.default_fast_mode && <span className="text-xs text-orange-500">Fast Mode</span>}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>📱</span>
                    <span>{template.default_platforms.length} platform(s)</span>
                  </div>
                </div>

                {/* Platforms */}
                {template.default_platforms.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {template.default_platforms.slice(0, 4).map(platform => (
                        <span
                          key={platform}
                          className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded"
                        >
                          {PLATFORM_LABELS[platform]}
                        </span>
                      ))}
                      {template.default_platforms.length > 4 && (
                        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
                          +{template.default_platforms.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Used {template.usage_count} time(s)</span>
                  {template.last_used_at && (
                    <span>
                      Last: {new Date(template.last_used_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                  <Link
                    href={`/admin/templates/${template.id}/edit`}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
