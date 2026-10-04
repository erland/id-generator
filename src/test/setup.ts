import '@testing-library/jest-dom/vitest'

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: () => false,
  })
}

if (typeof File.prototype.arrayBuffer !== 'function') {
  Object.defineProperty(File.prototype, 'arrayBuffer', {
    configurable: true,
    value(this: File): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
        reader.readAsArrayBuffer(this)
      })
    },
  })
}
