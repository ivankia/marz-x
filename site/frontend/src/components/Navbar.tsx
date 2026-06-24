import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Главная' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/dashboard', label: 'Кабинет' },
  { to: '/info', label: 'Информация' },
  { to: '/contacts', label: 'Контакты' },
];

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'color-mix(in oklab, var(--bg), transparent 22%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 1140, margin: '0 auto', padding: '0 32px',
        height: 74, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 24,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 9, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px -4px color-mix(in oklab, var(--accent), transparent 45%)',
          }}>
            <span style={{ width: 11, height: 11, background: '#fff', transform: 'rotate(45deg)', borderRadius: 2 }} />
          </span>
          <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--text)' }}>ppn</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: '6px 2px', fontSize: 15, textDecoration: 'none',
                color: isActive(to) ? 'var(--text)' : 'var(--muted)',
                fontWeight: isActive(to) ? 600 : 400,
                transition: 'color .15s',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px', background: 'transparent', color: 'var(--muted)',
                border: '1px solid var(--line-strong)', borderRadius: 'calc(var(--radius) - 6px)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
              }}
            >
              Выйти
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '10px 20px',
              background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              border: 'none', borderRadius: 'calc(var(--radius) - 6px)',
              fontSize: 14.5, fontWeight: 500, transition: 'background .15s', flexShrink: 0,
            }}
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}
