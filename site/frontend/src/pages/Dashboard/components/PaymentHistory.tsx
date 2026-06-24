import React from 'react';

interface Payment {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Props {
  payments: Payment[];
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Оплачено',
  pending: 'Ожидание',
  canceled: 'Отменено',
  chargebacked: 'Возврат',
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'oklch(0.58 0.13 152)',
  pending: 'oklch(0.66 0.13 70)',
  canceled: 'var(--faint)',
  chargebacked: 'oklch(0.55 0.16 25)',
};

const STATUS_BG: Record<string, string> = {
  confirmed: 'color-mix(in oklab, oklch(0.66 0.15 152), white 86%)',
  pending: 'color-mix(in oklab, oklch(0.66 0.13 70), white 86%)',
  canceled: 'oklch(0.96 0.005 285)',
  chargebacked: 'color-mix(in oklab, oklch(0.55 0.16 25), white 88%)',
};

export default function PaymentHistory({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px 28px', textAlign: 'center', color: 'var(--muted)', fontSize: 15, fontWeight: 300 }}>
        История платежей пуста
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '8px 26px' }}>
      {payments.map((p, i) => (
        <div
          key={p.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < payments.length - 1 ? '1px solid var(--line)' : 'none' }}
        >
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>
              {new Date(p.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{p.planId}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 14.5, fontVariantNumeric: 'tabular-nums' }}>{p.amount} {p.currency}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 9px', borderRadius: 6,
              color: STATUS_COLOR[p.status] ?? 'var(--faint)',
              background: STATUS_BG[p.status] ?? 'oklch(0.96 0.005 285)',
            }}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
