function getAppBaseUrl(): URL {
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')

  if (manifestLink?.href) {
    return new URL('./', manifestLink.href)
  }

  return new URL('./', window.location.href)
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    const appBaseUrl = getAppBaseUrl()
    const serviceWorkerUrl = new URL('sw.js', appBaseUrl)

    void navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: appBaseUrl.pathname })
      .catch((error: unknown) => {
        console.warn('Service worker registration failed.', error)
      })
  })
}
