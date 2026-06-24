import React, { useState } from 'react';
import Footer from '../../components/Footer';

const PRINCIPLES = [
  { icon: 'circle', title: 'Без журналов', desc: 'Не храним историю подключений и посещений.' },
  { icon: 'diamond', title: 'WireGuard', desc: 'Открытый протокол с проверенной криптографией.' },
  { icon: 'square', title: 'Прозрачность', desc: 'Честные тарифы без скрытых списаний.' },
];

const FAQ = [
  { q: 'Что такое PPN?', a: 'PPN — это VPN-сервис, который шифрует ваше соединение и скрывает реальный IP-адрес. Без рекламы, без сложных настроек и без журналов активности.' },
  { q: 'Вы храните логи?', a: 'Нет. Мы не записываем, какие сайты вы посещаете и когда подключаетесь. Хранить нечего — значит, нечего передать третьим лицам.' },
  { q: 'Сколько устройств можно подключить?', a: 'Один аккаунт работает одновременно на 10 устройствах: телефоны, ноутбуки, планшеты и даже роутер.' },
  { q: 'На каких платформах работает PPN?', a: 'macOS, Windows, iOS, Android и Linux. Приложение использует протокол WireGuard для стабильной скорости.' },
  { q: 'Можно ли вернуть деньги?', a: 'Да. В течение 30 дней после оплаты вернём всю сумму без лишних вопросов, если сервис не подойдёт.' },
];

function PrincipleIcon({ icon }: { icon: string }) {
  if (icon === 'circle') return <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }} />;
  if (icon === 'diamond') return <span style={{ width: 11, height: 11, background: 'var(--accent)', transform: 'rotate(45deg)', borderRadius: 2 }} />;
  return <span style={{ width: 11, height: 11, background: 'var(--accent)', borderRadius: 3 }} />;
}

export default function Info() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main style={{ flex: 1 }}>
      <section style={{ padding: '80px 0 var(--sec)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
            Информация
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 4.4vw, 54px)', fontWeight: 400, letterSpacing: '-0.028em', lineHeight: 1.06, margin: '16px 0 0' }}>
            Как работает PPN
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted)', margin: '20px 0 0', fontWeight: 300, lineHeight: 1.6 }}>
            PPN направляет ваш трафик через зашифрованный туннель на наш сервер. Сайты и провайдер видят адрес сервера, а не ваш реальный IP. Мы используем WireGuard — современный протокол, который быстрее и проще классических решений.
          </p>

          {/* Principles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 48 }}>
            {PRINCIPLES.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PrincipleIcon icon={icon} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '16px 0 0' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', margin: '6px 0 0', fontWeight: 300, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: '64px 0 0' }}>Частые вопросы</h2>
          <div style={{ marginTop: 20, borderTop: '1px solid var(--line)' }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 20, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em' }}>{f.q}</span>
                  <span style={{
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform .2s', fontSize: 22,
                    color: openFaq === i ? 'var(--accent)' : 'var(--faint)',
                    lineHeight: 1, flexShrink: 0,
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300, margin: 0, paddingBottom: 24, maxWidth: '64ch' }}>
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
