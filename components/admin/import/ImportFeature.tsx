'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ImportFeature() {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'city' | 'set'>('city')
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Parse file
    const text = await selectedFile.text()
    let data: any[] = []

    if (selectedFile.name.endsWith('.csv')) {
      // Parse CSV
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      data = lines.slice(1).map(line => {
        const values = line.split(',')
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header.trim()] = values[i]?.trim() || ''
        })
        return obj
      })
    } else if (selectedFile.name.endsWith('.json')) {
      // Parse JSON
      data = JSON.parse(text)
    }

    setPreview(data.slice(0, 5)) // Show first 5 rows
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', importType)

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        alert(`Successfully imported ${data.count} items!`)
        setFile(null)
        setPreview([])
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error importing:', error)
      alert('Error importing file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Import Type Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Import Type</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setImportType('city')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              importType === 'city'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Cities
          </button>
          <button
            onClick={() => setImportType('set')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              importType === 'set'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Sets
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload File</h3>
        <div className="space-y-4">
          <label className="block">
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
              id="import-file"
            />
            <div className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
              {file ? (
                <span className="text-gray-900 dark:text-white font-semibold">{file.name}</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload CSV or JSON file
                </span>
              )}
            </div>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: CSV, JSON. Make sure the file matches the {importType} structure.
          </p>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Preview (First 5 rows)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {Object.keys(preview[0] || {}).map((key) => (
                    <th key={key} className="text-left p-2 text-gray-700 dark:text-gray-300">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-900">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="p-2 text-gray-600 dark:text-gray-400">
                        {String(value).substring(0, 50)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Button */}
      {file && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleImport}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
        >
          {loading ? 'Importing...' : `Import ${importType === 'city' ? 'Cities' : 'Sets'}`}
        </motion.button>
      )}
    </div>
  )
}
