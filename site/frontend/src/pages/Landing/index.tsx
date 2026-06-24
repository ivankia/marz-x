import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';

const FEATURES = [
  { icon: 'circle', title: 'Тихая скорость', desc: 'Серверы на 1 Гбит/с без рекламных обещаний. Просто работает — для стриминга, игр и звонков.' },
  { icon: 'diamond', title: 'Ноль журналов', desc: 'Мы не храним, какие сайты вы посещаете. Нечего запросить и нечего потерять.' },
  { icon: 'square', title: 'Один тап', desc: 'Подключение в одно касание на всех устройствах. Без ручных настроек и конфигов.' },
];

const STEPS = [
  { n: '01', title: 'Создайте аккаунт', desc: 'Почта и пароль — этого достаточно. Карта не нужна для пробного периода.' },
  { n: '02', title: 'Выберите сервер', desc: '60+ стран на выбор. Или дайте PPN подключить ближайший автоматически.' },
  { n: '03', title: 'Готово', desc: 'Трафик зашифрован. Можно закрыть приложение — защита остаётся.' },
];

function FeatureIcon({ icon }: { icon: string }) {
  if (icon === 'circle') return <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)' }} />;
  if (icon === 'diamond') return <span style={{ width: 13, height: 13, background: 'var(--accent)', transform: 'rotate(45deg)', borderRadius: 2 }} />;
  return <span style={{ width: 13, height: 13, background: 'var(--accent)', borderRadius: 3 }} />;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTry = () => navigate(user ? '/dashboard' : '/register');
  const handlePricing = () => navigate('/pricing');

  return (
    <main style={{ flex: 1 }}>

      {/* ── Hero A ─────────────────────────────────── */}
      <section style={{ padding: '84px 0 76px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
            Приватность по умолчанию
          </div>
          <h1 style={{ fontSize: 'clamp(42px, 5.6vw, 70px)', fontWeight: 400, letterSpacing: '-0.028em', lineHeight: 1.04, margin: '20px 0 0', maxWidth: '15ch' }}>
            Приватный интернет без лишнего шума
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '52ch', margin: '24px 0 0', fontWeight: 300 }}>
            PPN — это спокойное, быстрое и честное VPN-соединение. Никаких журналов, никаких сложных настроек. Просто защита, о которой можно не думать.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleTry}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 26px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
            >
              Попробовать 7 дней бесплатно
            </button>
            <button
              onClick={handlePricing}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--line-strong)', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
            >
              Смотреть тарифы
            </button>
          </div>
          <div style={{ marginTop: 18, fontSize: 13.5, color: 'var(--faint)' }}>Без привязки карты · Отмена в один клик</div>

          {/* Mock status card */}
          <div style={{ marginTop: 68, width: '100%', maxWidth: 440, textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 26, boxShadow: '0 1px 2px rgba(30,20,60,0.04),0 24px 60px -34px rgba(50,35,110,0.30)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'oklch(0.66 0.15 152)', boxShadow: '0 0 0 4px color-mix(in oklab, oklch(0.66 0.15 152), transparent 82%)' }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Защищено</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--faint)' }}>176.58.124.83</span>
            </div>
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Текущий сервер</div>
                <div style={{ fontSize: 21, fontWeight: 500, marginTop: 6, letterSpacing: '-0.01em' }}>Нидерланды</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 2 }}>Амстердам · 18 мс</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--accent-d)', background: 'var(--accent-soft)', padding: '9px 12px', borderRadius: 10, flexShrink: 0 }}>NL</span>
            </div>
            <div style={{ marginTop: 24, padding: 14, borderRadius: 'calc(var(--radius) - 5px)', background: 'transparent', border: '1px solid var(--line-strong)', textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Отключиться
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ─────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[['0', 'журналов'], ['60+', 'локаций'], ['99.9%', 'аптайм'], ['10', 'устройств']].map(([num, label], i) => (
            <div key={i} style={{ padding: '38px 24px', textAlign: 'center', ...(i > 0 ? { borderLeft: '1px solid var(--line)' } : {}) }}>
              <div style={{ fontSize: 34, fontWeight: 400, letterSpacing: '-0.02em' }}>{num}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.03em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section style={{ padding: 'var(--sec) 0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>Почему PPN</div>
          <h2 style={{ fontSize: 'clamp(30px, 3.6vw, 42px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '14px 0 0', maxWidth: '18ch' }}>
            Спокойствие в деталях
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 48 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px 28px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FeatureIcon icon={icon} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 600, margin: '22px 0 0', letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', margin: '9px 0 0', fontWeight: 300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section style={{ padding: '0 0 var(--sec)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48 }}>
            {STEPS.map(({ n, title, desc }) => (
              <div key={n}>
                <div style={{ fontSize: 14, color: 'var(--faint)', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
                <h3 style={{ fontSize: 20, fontWeight: 500, margin: '14px 0 0', letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 15, color: 'var(--muted)', margin: '8px 0 0', fontWeight: 300, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────── */}
      <section style={{ padding: '0 0 var(--sec)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent), transparent 80%)', borderRadius: 'calc(var(--radius) + 6px)', padding: '64px 56px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 400, letterSpacing: '-0.02em', margin: '0 auto', maxWidth: '20ch' }}>
              Спокойный интернет начинается сегодня
            </h2>
            <p style={{ fontSize: 17, color: 'var(--muted)', margin: '16px auto 0', maxWidth: '44ch', fontWeight: 300 }}>
              7 дней бесплатно. Без привязки карты и без автосписаний.
            </p>
            <button
              onClick={handleTry}
              style={{ marginTop: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '15px 30px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15.5, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
            >
              Попробовать PPN
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
