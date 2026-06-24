import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth } from '../../services/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    auth.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '48px 32px', boxShadow: '0 1px 2px rgba(30,20,60,0.04),0 24px 60px -34px rgba(50,35,110,0.18)', textAlign: 'center' }}>
        <h4 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Подтверждение почты</h4>

        {status === 'loading' && (
          <>
            <style>{`@keyframes ppn-spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: 28, height: 28, border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'ppn-spin 0.7s linear infinite', margin: '0 auto' }} />
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'color-mix(in oklab, oklch(0.66 0.15 152), white 86%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 24, color: 'oklch(0.58 0.13 152)' }}>✓</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>Почта подтверждена</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 24px', fontWeight: 300 }}>Теперь вы можете войти в аккаунт.</p>
            <Link
              to="/login"
              style={{ display: 'inline-flex', padding: '12px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'background .15s' }}
            >
              Войти
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'color-mix(in oklab, oklch(0.55 0.16 25), white 88%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 22, color: 'oklch(0.55 0.16 25)' }}>×</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>Ссылка недействительна</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 24px', fontWeight: 300 }}>Ссылка истекла или уже использована.</p>
            <Link
              to="/login"
              style={{ display: 'inline-flex', padding: '12px 28px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--line-strong)', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'all .15s' }}
            >
              На главную
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
