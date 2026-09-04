import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PulseLogo - Official Original Brand Vector Identity for Pulse Social Hub
 *
 * Symbol Architecture:
 * - Geometric Stylized "P"
 * - Heartbeat / Pulse Audio & Vital Waveform
 * - Radiant 4-Point Creative Spark (✦)
 * - Circular Social Community Ring with Glassmorphic Gradient
 */
export const PulseIcon = ({ size = 36, className = '', glow = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${glow ? 'filter drop-shadow-[0_0_12px_rgba(6,182,212,0.45)]' : ''} ${className}`}
    >
      <defs>
        {/* Main Brand Gradient: Electric Cyan -> Royal Blue -> Neon Purple -> Pink */}
        <linearGradient id="pulseBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="35%" stopColor="#38BDF8" />
          <stop offset="70%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Glow Shadow Gradient */}
        <linearGradient id="pulseGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.8" />
        </linearGradient>

        {/* Inner Glass Container Gradient */}
        <linearGradient id="pulseGlassBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
        </linearGradient>

        {/* Spark Star Gradient */}
        <linearGradient id="pulseSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#A5F3FC" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>

        <filter id="pulseNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Social Orb / Rounded Squircle Shield */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="26"
        fill="url(#pulseGlassBg)"
        stroke="url(#pulseBrandGrad)"
        strokeWidth="2.5"
      />

      {/* Ambient Inner Orb Glow */}
      <circle cx="50" cy="50" r="32" fill="#06B6D4" opacity="0.08" filter="blur(10px)" />
      <circle cx="68" cy="36" r="18" fill="#EC4899" opacity="0.12" filter="blur(8px)" />

      {/* 
        The Original "P" + Pulse Waveform Monogram Path
        - Starts at the base of the 'P' vertical stem (x:28, y:76)
        - Ascends up to y:26
        - Loops around the top right loop of 'P'
        - Integrates the electrocardiogram heartbeat peak (Pulse) inside the loop junction
      */}
      {/* Outer Glow Pass */}
      <path
        d="M28 76V26C28 26 34 22 48 22C64 22 72 30 72 42C72 54 62 60 48 60H38L42 50L46 64L50 56L54 60H64"
        stroke="url(#pulseGlowGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />

      {/* Main Crisp Vector Pass */}
      <path
        d="M28 76V26C28 26 34 22 48 22C64 22 72 30 72 42C72 54 62 60 48 60H38L42 50L46 64L50 56L54 60H64"
        stroke="url(#pulseBrandGrad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Secondary Pulse Echo Wave Line (Bottom Vital Beat) */}
      <path
        d="M26 62H32L35 55L39 68L43 62H47"
        stroke="#22D3EE"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Creative Energy Spark / Four-Point Star (✦) */}
      <g transform="translate(68, 22)">
        <path
          d="M0 -7C0.8 -2.5 2.5 -0.8 7 0C2.5 0.8 0.8 2.5 0 7C-0.8 2.5 -2.5 0.8 -7 0C-2.5 -0.8 -0.8 -2.5 0 -7Z"
          fill="url(#pulseSparkGrad)"
          filter="url(#pulseNeonGlow)"
        />
        <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
      </g>

      {/* Micro Social Node Dot */}
      <circle cx="28" cy="76" r="3.5" fill="#38BDF8" />
    </svg>
  );
};

export const PulseLogo = ({
  variant = 'full', // 'full' | 'sidebar' | 'icon' | 'watermark' | 'horizontal'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  to = '/',
  className = '',
  showLink = true
}) => {
  // Size metrics
  const sizeMap = {
    xs: { icon: 24, title: 'text-sm', sub: 'text-[7px]' },
    sm: { icon: 30, title: 'text-base', sub: 'text-[8px]' },
    md: { icon: 38, title: 'text-xl', sub: 'text-[9px]' },
    lg: { icon: 48, title: 'text-2xl', sub: 'text-[10px]' },
    xl: { icon: 64, title: 'text-4xl', sub: 'text-[12px]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // 1. Icon Only
  if (variant === 'icon') {
    const iconContent = (
      <div className={`inline-flex items-center justify-center group ${className}`}>
        <PulseIcon size={currentSize.icon} className="group-hover:scale-105 transition-transform duration-200" />
      </div>
    );
    return showLink ? <Link to={to}>{iconContent}</Link> : iconContent;
  }

  // 2. Watermark for Reels / Video Studio
  if (variant === 'watermark') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 select-none shadow-lg ${className}`}>
        <PulseIcon size={16} glow={false} />
        <span className="font-black text-[11px] tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-400 bg-clip-text text-transparent uppercase">
          Pulse
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 border-l border-white/20">
          Studio
        </span>
      </div>
    );
  }

  // 3. Full / Sidebar / Horizontal Logo
  const logoContent = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Symbol Emblem */}
      <div className="relative">
        <PulseIcon
          size={currentSize.icon}
          className="group-hover:scale-105 group-hover:rotate-1 transition-all duration-300"
        />
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <span
            className={`font-black ${currentSize.title} tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-sky-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]`}
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            PULSE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 ml-1 mb-1 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
        </div>

        <span
          className={`font-black ${currentSize.sub} tracking-[0.28em] uppercase text-slate-400 dark:text-slate-400 leading-tight mt-0.5`}
          style={{ letterSpacing: '0.28em' }}
        >
          SOCIAL HUB
        </span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default PulseLogo;
