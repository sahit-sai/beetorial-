import React from 'react'
import { Video, VideoOff, ExternalLink } from 'lucide-react'
import { validateMeetingUrl } from '../../lib/providers'
import { logSecurityEvent } from '../../lib/audit'
import { useAuth } from '../../lib/authContext'

interface MeetingLauncherProps {
  meetingUrl?: string | null
  classTitle?: string
  classId?: string
  canEdit?: boolean
  onEditMeeting?: () => void
}

export const MeetingLauncher: React.FC<MeetingLauncherProps> = ({
  meetingUrl,
  classTitle = 'Live Session',
  classId,
  canEdit = false,
  onEditMeeting,
}) => {
  const { user } = useAuth()
  const { isValid, provider, errorMessage } = validateMeetingUrl(meetingUrl)

  const handleLaunch = () => {
    if (!isValid || !meetingUrl) return

    logSecurityEvent(
      'JOIN_VIDEO_CLASS',
      'classes',
      classId || null,
      { meeting_url: meetingUrl, provider },
      user || undefined
    )

    window.open(meetingUrl, '_blank', 'noopener,noreferrer')
  }

  if (!isValid) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '9px',
            fontWeight: 700,
            color: '#8b92a8',
            background: '#f4f5fa',
            padding: '6px 10px',
            borderRadius: '7px',
          }}
          title={errorMessage || 'No meeting configured'}
        >
          <VideoOff size={13} />
          Provider Unconfigured
        </span>
        {canEdit && onEditMeeting && (
          <button
            type="button"
            className="subtle-button"
            onClick={onEditMeeting}
            style={{ padding: '5px 8px', fontSize: '9px' }}
          >
            Set Link
          </button>
        )}
      </div>
    )
  }

  const providerLabel =
    provider === 'google_meet'
      ? 'Google Meet'
      : provider === 'zoom'
      ? 'Zoom'
      : provider === 'jitsi'
      ? 'Jitsi'
      : 'Video Classroom'

  return (
    <button
      type="button"
      className="button button-primary"
      onClick={handleLaunch}
      style={{ padding: '8px 12px', fontSize: '10px' }}
      title={`Join via ${providerLabel}: ${classTitle}`}
    >
      <Video size={14} />
      <span>Join {providerLabel}</span>
      <ExternalLink size={12} />
    </button>
  )
}
