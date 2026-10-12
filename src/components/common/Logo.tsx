import React from 'react'
import { Link } from 'react-router-dom'

interface LogoProps {
  hideSmall?: boolean
  className?: string
  onlyMark?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  hideSmall,
  className = '',
  onlyMark = false,
}) => {
  return (
    <Link to="/" className={`logo ${className}`.trim()} aria-label="Beetorial Home">
      {onlyMark ? (
        <img
          src="/beetorial-mark.png"
          alt="Beetorial"
          className="logo-mark-img"
          width={36}
          height={36}
        />
      ) : (
        <img
          src="/beetorial-logo.png"
          alt="Beetorial"
          className="logo-img"
          height={34}
        />
      )}
    </Link>
  )
}
