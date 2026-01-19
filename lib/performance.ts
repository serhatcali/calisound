// Performance monitoring and optimization utilities

// Measure page load performance
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = window.performance.timing
      // Ensure valid timing data
      const pageLoadTime = perfData.loadEventEnd > 0 && perfData.navigationStart > 0
        ? perfData.loadEventEnd - perfData.navigationStart
        : 0
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart

      console.log('Performance Metrics:', {
        pageLoadTime: `${pageLoadTime}ms`,
        domContentLoaded: `${domContentLoaded}ms`,
      })

      // Send to analytics if available
      if ((window as any).gtag) {
        ;(window as any).gtag('event', 'page_load_time', {
          value: pageLoadTime,
          event_category: 'Performance',
        })
      }
    }
  })
}

// Lazy load images
export function lazyLoadImages() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          observer.unobserve(img)
        }
      }
    })
  })

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img)
  })
}

// Prefetch resources
export function prefetchResource(url: string, as: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  link.as = as
  document.head.appendChild(link)
}

// Preconnect to external domains
export function preconnectDomain(domain: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = domain
  document.head.appendChild(link)
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
