// ====================================================================
// Beetorial External Provider Integrity Layer
// Strict gating for Payments and Video Conferencing
// ====================================================================

import { VideoMeetingProvider } from '../types'

/**
 * Checks whether live payment provider credentials are present.
 * NEVER fakes payment confirmation if keys are missing.
 */
export function isPaymentProviderConfigured(): boolean {
  const provider = import.meta.env.VITE_PAYMENT_PROVIDER
  const keyId = import.meta.env.VITE_PAYMENT_KEY_ID
  return Boolean(
    provider &&
    provider.trim() !== '' &&
    keyId &&
    keyId.trim() !== '' &&
    !keyId.includes('your_key')
  )
}

export function getPaymentProviderName(): string {
  if (!isPaymentProviderConfigured()) {
    return 'Demo Test Sandbox'
  }
  return import.meta.env.VITE_PAYMENT_PROVIDER || 'Configured Gateway'
}

/**
 * Detects meeting provider type and validates whether URL is real & safe.
 */
export function validateMeetingUrl(url?: string | null): {
  isValid: boolean
  provider: VideoMeetingProvider
  errorMessage?: string
} {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return {
      isValid: false,
      provider: 'unconfigured',
      errorMessage: 'No video class link configured for this session.',
    }
  }

  const trimmed = url.trim()

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()

    if (host.includes('meet.google.com')) {
      return { isValid: true, provider: 'google_meet' }
    }

    if (host.includes('zoom.us')) {
      return { isValid: true, provider: 'zoom' }
    }

    if (host.includes('meet.jit.si') || host.includes('jitsi')) {
      return { isValid: true, provider: 'jitsi' }
    }

    // Generic valid HTTPS URL
    if (parsed.protocol === 'https:') {
      return { isValid: true, provider: 'google_meet' }
    }

    return {
      isValid: false,
      provider: 'unconfigured',
      errorMessage: 'Video meeting URL must use a secure https:// link.',
    }
  } catch {
    return {
      isValid: false,
      provider: 'unconfigured',
      errorMessage: 'Malformed meeting URL.',
    }
  }
}

export function isVideoProviderConfigured(meetingUrl?: string | null): boolean {
  const result = validateMeetingUrl(meetingUrl)
  return result.isValid && result.provider !== 'unconfigured'
}
