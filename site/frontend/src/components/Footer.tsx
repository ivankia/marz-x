import React from 'react';
import { Link } from 'react-router-dom';

const COLS = [
  {
    title: 'Продукт',
    links: [['Тарифы', '/pricing'], ['Возможности', '/info'], ['Личный кабинет', '/dashboard']],
  },
  {
    title: 'Компания',
    links: [['О сервисе', '/info'], ['Контакты', '/contacts']],
  },
  {
    title: 'Поддержка',
    links: [['Помощь', '/info'], ['Контакты', '/contacts']],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, padding: '60px 0 40px' }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ width: 9, height: 9, background: '#fff', transform: 'rotate(45deg)', borderRadius: 2 }} />
              </span>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text)' }}>ppn</span>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '16px 0 0', fontWeight: 300, maxWidth: '30ch', lineHeight: 1.6 }}>
              Спокойный VPN без лишнего. Приватность по умолчанию.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>{title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(([label, to]) => (
                  <Link
                    key={label}
                    to={to}
                    style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--line)', padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--faint)' }}>© {new Date().getFullYear()} PPN. Сделано спокойно.</span>
          <span style={{ fontSize: 13, color: 'var(--faint)' }}>Конфиденциальность · Условия</span>
        </div>
      </div>
    </footer>
  );
}
