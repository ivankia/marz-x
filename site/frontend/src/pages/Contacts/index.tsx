import React, { useState } from 'react';
import Footer from '../../components/Footer';

const INFO_CARDS = [
  { label: 'Поддержка', value: 'support@ppn.app', desc: 'Ответ в течение 2 часов' },
  { label: 'Telegram', value: '@ppn_support', desc: 'Быстрые вопросы и статусы' },
  { label: 'Время работы', value: '24 / 7', desc: 'Каждый день, без выходных' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1px solid var(--line-strong)',
  borderRadius: 11, fontSize: 15, fontFamily: 'inherit', color: 'var(--text)',
  background: 'var(--bg)', outline: 'none',
};

export default function Contacts() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main style={{ flex: 1 }}>
      <section style={{ padding: '80px 0 var(--sec)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
            Контакты
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 4.4vw, 54px)', fontWeight: 400, letterSpacing: '-0.028em', lineHeight: 1.06, margin: '16px 0 0' }}>
            Мы на связи
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted)', margin: '18px 0 0', fontWeight: 300, maxWidth: '52ch' }}>
            Напишите нам — обычно отвечаем в течение пары часов, без ботов и шаблонов.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 48, marginTop: 52, alignItems: 'start' }}>
            {/* Form card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 32 }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <span style={{ color: 'var(--accent)', fontSize: 22 }}>✓</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 500, margin: '18px 0 0' }}>Сообщение отправлено</h3>
                  <p style={{ fontSize: 15, color: 'var(--muted)', margin: '8px 0 0', fontWeight: 300 }}>
                    Спасибо! Мы ответим на вашу почту в ближайшее время.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginBottom: 8 }}>Имя</label>
                  <input type="text" placeholder="Как к вам обращаться" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginTop: 18, marginBottom: 8 }}>E-mail</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--muted)', marginTop: 18, marginBottom: 8 }}>Сообщение</label>
                  <textarea
                    rows={4} placeholder="Расскажите, чем помочь" value={message}
                    onChange={(e) => setMessage(e.target.value)} required
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />

                  <button
                    type="submit"
                    style={{ marginTop: 22, width: '100%', padding: 14, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
                  >
                    Отправить
                  </button>
                </form>
              )}
            </div>

            {/* Info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {INFO_CARDS.map(({ label, value, desc }) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                  <div style={{ fontSize: 17, fontWeight: 500, marginTop: 8 }}>{value}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
