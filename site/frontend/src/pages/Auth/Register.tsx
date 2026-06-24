import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';
import { useTranslation } from 'react-i18next';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1px solid var(--line-strong)',
  borderRadius: 11, fontSize: 15, fontFamily: 'inherit', color: 'var(--text)',
  background: 'var(--bg)', outline: 'none',
};

export default function Register() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Пароль должен содержать минимум 8 символов'); return; }
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      await auth.register({ email, password, lang: i18n.language });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '48px 32px', boxShadow: '0 1px 2px rgba(30,20,60,0.04),0 24px 60px -34px rgba(50,35,110,0.18)', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <span style={{ fontSize: 24, color: 'var(--accent)' }}>✉</span>
          </div>
          <h5 style={{ fontSize: 20, fontWeight: 600, margin: '20px 0 8px' }}>Проверьте почту</h5>
          <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, fontWeight: 300 }}>
            Мы отправили письмо на <strong>{email}</strong>. Перейдите по ссылке для подтверждения.
          </p>
          <button
            onClick={() => auth.resendVerification(email)}
            style={{ marginTop: 20, padding: '8px 16px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line-strong)', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
          >
            Отправить повторно
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '36px 32px', boxShadow: '0 1px 2px rgba(30,20,60,0.04),0 24px 60px -34px rgba(50,35,110,0.18)' }}>
        <h4 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Создать аккаунт</h4>

        {error && (
          <div style={{ padding: '12px 15px', background: 'color-mix(in oklab, oklch(0.55 0.16 25), white 88%)', borderRadius: 10, marginBottom: 20, fontSize: 14, color: 'oklch(0.35 0.1 25)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus style={inputStyle} />

          <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginTop: 18, marginBottom: 8 }}>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

          <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginTop: 18, marginBottom: 8 }}>Повторите пароль</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inputStyle} />

          <button
            type="submit" disabled={loading}
            style={{ marginTop: 24, width: '100%', padding: 14, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all .15s' }}
          >
            {loading ? '...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, marginBottom: 0, fontSize: 14, color: 'var(--muted)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
