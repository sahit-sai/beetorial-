import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export const Logo: React.FC<{ hideSmall?: boolean }> = ({ hideSmall }) => {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark">
        <Sparkles size={19} />
      </span>
      <span>
        beetorial<span className="logo-dot">.</span>
        {!hideSmall && <small>LEARN WITH CONFIDENCE</small>}
      </span>
    </Link>
  )
}
