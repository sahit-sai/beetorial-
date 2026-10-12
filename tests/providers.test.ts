import { describe, it, expect } from 'vitest'
import {
  isPaymentProviderConfigured,
  getPaymentProviderName,
  validateMeetingUrl,
  isVideoProviderConfigured,
} from '../src/lib/providers'

describe('Provider Integrity & Gating Guards', () => {
  it('correctly reports unconfigured payment provider when env vars are missing', () => {
    // In local dev without keys, should report unconfigured
    expect(isPaymentProviderConfigured()).toBe(false)
    expect(getPaymentProviderName()).toBe('Demo Test Sandbox')
  })

  it('validates Google Meet URLs correctly', () => {
    const meetUrl = 'https://meet.google.com/abc-defg-hij'
    const result = validateMeetingUrl(meetUrl)
    expect(result.isValid).toBe(true)
    expect(result.provider).toBe('google_meet')
    expect(isVideoProviderConfigured(meetUrl)).toBe(true)
  })

  it('validates Zoom URLs correctly', () => {
    const zoomUrl = 'https://us02web.zoom.us/j/1234567890'
    const result = validateMeetingUrl(zoomUrl)
    expect(result.isValid).toBe(true)
    expect(result.provider).toBe('zoom')
  })

  it('rejects empty or malformed meeting links', () => {
    expect(validateMeetingUrl('').isValid).toBe(false)
    expect(validateMeetingUrl('not-a-url').isValid).toBe(false)
    expect(validateMeetingUrl(null).isValid).toBe(false)
    expect(isVideoProviderConfigured(null)).toBe(false)
  })
})
