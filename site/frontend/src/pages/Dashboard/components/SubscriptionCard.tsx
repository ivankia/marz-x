import React from 'react';

interface Sub {
  planId: string;
  planName: { ru: string; en: string };
  status: string;
  expiresAt: string;
  usedTrafficBytes: number;
  dataLimitBytes: number;
  dataLimitGB: number | null;
}

interface Props {
  sub: Sub | null;
  onRenew: () => void;
  onBuy: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Б';
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(bytes / 1024 ** 2).toFixed(0)} МБ`;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Активна',
  expired: 'Истекла',
  canceled: 'Отменена',
};

const STATUS_COLOR: Record<string, string> = {
  active: 'oklch(0.58 0.13 152)',
  expired: 'oklch(0.55 0.16 25)',
  canceled: 'var(--faint)',
};

const STATUS_BG: Record<string, string> = {
  active: 'color-mix(in oklab, oklch(0.66 0.15 152), white 86%)',
  expired: 'color-mix(in oklab, oklch(0.55 0.16 25), white 88%)',
  canceled: 'oklch(0.96 0.005 285)',
};

export default function SubscriptionCard({ sub, onRenew, onBuy }: Props) {
  if (!sub) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28, marginBottom: 20 }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <span style={{ width: 20, height: 20, background: 'var(--accent)', transform: 'rotate(45deg)', borderRadius: 4 }} />
          </div>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: '16px 0 0', fontWeight: 300 }}>У вас нет активной подписки</p>
          <button
            onClick={onBuy}
            style={{ marginTop: 20, padding: '12px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 5px)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
          >
            Выбрать тариф
          </button>
        </div>
      </div>
    );
  }

  const usedPct = sub.dataLimitBytes > 0
    ? Math.min(100, Math.round((sub.usedTrafficBytes / sub.dataLimitBytes) * 100))
    : 0;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Активный тариф</div>
          <div style={{ fontSize: 24, fontWeight: 500, marginTop: 6, letterSpacing: '-0.01em' }}>{sub.planName.ru}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
            color: STATUS_COLOR[sub.status] ?? 'var(--faint)',
            background: STATUS_BG[sub.status] ?? 'oklch(0.96 0.005 285)',
          }}>
            {STATUS_LABEL[sub.status] ?? sub.status}
          </span>
          <button
            onClick={onRenew}
            style={{ padding: '10px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'calc(var(--radius) - 6px)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
          >
            Продлить
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Истекает</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>
            {new Date(sub.expiresAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Трафик</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
            {formatBytes(sub.usedTrafficBytes)}
            <span style={{ color: 'var(--muted)', fontWeight: 300 }}>
              {sub.dataLimitGB ? ` / ${sub.dataLimitGB} ГБ` : ' / ∞'}
            </span>
          </div>
        </div>
      </div>

      {sub.dataLimitBytes > 0 && (
        <div style={{ marginTop: 16, height: 6, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999, transition: 'width .3s',
            width: `${usedPct}%`,
            background: usedPct > 80 ? 'oklch(0.55 0.16 25)' : usedPct > 50 ? 'oklch(0.66 0.13 70)' : 'var(--accent)',
          }} />
        </div>
      )}
    </div>
  );
}
