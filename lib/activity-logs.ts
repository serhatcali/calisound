interface ActivityLog {
  id?: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  entity_type: 'city' | 'set' | 'link' | 'contact' | 'settings'
  entity_id: string
  entity_name?: string
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at?: string
}

export async function logActivity(
  action: ActivityLog['action'],
  entityType: ActivityLog['entity_type'],
  entityId: string,
  entityName?: string,
  changes?: Record<string, any>
) {
  try {
    // Get user info from session (if available)
    const userId = 'admin' // In a real app, get from session
    
    // Get IP and user agent from request (if available)
    const ipAddress = typeof window !== 'undefined' ? undefined : undefined
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : undefined

    const log: ActivityLog = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    // Call API to save log
    await fetch('/api/admin/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - logging should not break the app
  }
}

export async function getActivityLogs(limit = 50) {
  try {
    const response = await fetch(`/api/admin/activity-logs?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch logs')
    return await response.json()
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return []
  }
}
