import React from 'react';

export const Lock: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de cadeado"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export const Error: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="red"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de erro"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const Success: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="green"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de sucesso"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 12 15 17 10" />
  </svg>
);

export const Minus: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de remover"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const Camera: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de câmera"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

export const EyeOff: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de olho fechado"
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7a11.57 11.57 0 0 1 2.29-3.68"></path>
    <path d="M1 1l22 22"></path>
    <path d="M9.53 9.53a3 3 0 0 0 4.95 4.95"></path>
  </svg>
);

export const Eye: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ícone de olho aberto"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

 
export const User = () => <span>👤</span>;
export const Image = () => <span>📷</span>;
export const Email = () => <span>📧</span>;
export const Phone = () => <span>📱</span>;
export const Password = () => <span>🔒</span>;
export const Calendar = () => <span>📅</span>;
export const Dumbbell = () => <span>🏋️</span>;
export const Food = () => <span>🍽️</span>;
export const File = () => <span>📄</span>;
export const Plus = () => <span>➕</span>; 
export const EyeOpen = () => <span>🙈</span>;
export const EyeClose = () => <span>👁️</span>;
export const Refresh = () => <span>🔄</span>;
export const Save = () => <span>💾</span>;
export const Cancel = () => <span>🚫</span>;
export const Loading = () => <span>⏳</span>;
export const Sun = () => <span>☀️</span>;
export const Moon = () => <span>🌙</span>;
export const ChevronDown = () => <span>⌄</span>;
export const Repeat = () => <span>🔁</span>;
export const Video = () => <span>🎥</span>;
export const Info = () => <span>ℹ️</span>;
export const Scale = () => <span>⚖️</span>;