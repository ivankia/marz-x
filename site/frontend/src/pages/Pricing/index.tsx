import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plans as plansApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';

interface Plan {
  id: string;
  name: { ru: string; en: string };
  price: number;
  currency: string;
  durationDays: number;
  dataLimitGB: number | null;
  popular: boolean;
  features: { ru: string[]; en: string[] };
}

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plansList, setPlansList] = useState<Plan[]>([]);

  useEffect(() => {
    plansApi.getAll().then((r) => setPlansList(r.data)).catch(() => {});
  }, []);

  const handleSelect = (planId: string) => {
    if (user) {
      navigate('/dashboard', { state: { openPayment: planId } });
    } else {
      navigate('/register', { state: { planId } });
    }
  };

  return (
    <main style={{ flex: 1 }}>
      <section style={{ padding: '80px 0 var(--sec)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
              Тарифы
            </div>
            <h1 style={{ fontSize: 'clamp(38px, 4.6vw, 58px)', fontWeight: 400, letterSpacing: '-0.028em', lineHeight: 1.05, margin: '16px 0 0' }}>
              Один сервис. Честная цена.
            </h1>
            <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: '50ch', margin: '18px auto 0', fontWeight: 300 }}>
              Все возможности доступны в любом тарифе. Чем длиннее период — тем выгоднее месяц.
            </p>
          </div>

          {/* Plans grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 56, alignItems: 'start' }}>
            {plansList.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: 'var(--surface)',
                  border: plan.popular ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  padding: '32px 30px',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 30px 70px -44px rgba(50,35,110,0.4)' : 'none',
                }}
              >
                {plan.popular && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600,
                    letterSpacing: '0.04em', padding: '6px 14px', borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}>
                    Популярный
                  </span>
                )}
                <div style={{ fontSize: 15, fontWeight: 600, color: plan.popular ? 'var(--accent-d)' : 'var(--muted)' }}>
                  {plan.name.ru}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 18 }}>
                  <span style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-0.03em' }}>{plan.price} ₽</span>
                  <span style={{ fontSize: 15, color: 'var(--faint)' }}>/ мес</span>
                </div>
                <button
                  onClick={() => handleSelect(plan.id)}
                  style={{
                    width: '100%', marginTop: 24, padding: 13,
                    background: plan.popular ? 'var(--accent)' : 'transparent',
                    color: plan.popular ? '#fff' : 'var(--text)',
                    border: plan.popular ? 'none' : '1px solid var(--line-strong)',
                    borderRadius: 'calc(var(--radius) - 6px)',
                    fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  Выбрать
                </button>
                <ul style={{ listStyle: 'none', padding: 0, margin: '26px 0 0', borderTop: '1px solid var(--line)', paddingTop: 22 }}>
                  {plan.features.ru.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14.5, color: 'var(--text)', padding: '7px 0' }}>
                      <span style={{ color: 'var(--accent)', fontSize: 13, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 14, color: 'var(--muted)' }}>
            30 дней на возврат денег · Оплата картой, СБП или криптовалютой
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
