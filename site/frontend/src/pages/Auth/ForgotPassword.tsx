import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../services/api';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1px solid var(--line-strong)',
  borderRadius: 11, fontSize: 15, fontFamily: 'inherit', color: 'var(--text)',
  background: 'var(--bg)', outline: 'none',
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await auth.forgotPassword(email).catch(() => {});
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '36px 32px', boxShadow: '0 1px 2px rgba(30,20,60,0.04),0 24px 60px -34px rgba(50,35,110,0.18)' }}>
        <h4 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Восстановление пароля</h4>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 24px', fontWeight: 300 }}>
          Введите адрес почты — пришлём ссылку для сброса.
        </p>

        {sent ? (
          <div style={{ padding: '16px', background: 'color-mix(in oklab, oklch(0.66 0.15 152), white 86%)', borderRadius: 10, fontSize: 14, color: 'oklch(0.35 0.1 152)', textAlign: 'center' }}>
            Письмо отправлено. Проверьте почту.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus style={inputStyle} />
            <button
              type="submit" disabled={loading}
              style={{ marginTop: 22, width: '100%', padding: 14, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all .15s' }}
            >
              {loading ? '...' : 'Отправить'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, marginBottom: 0, fontSize: 14, color: 'var(--muted)' }}>
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>← Вернуться к входу</Link>
        </p>
      </div>
    </div>
  );
}
