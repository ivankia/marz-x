import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscriptions as subsApi, payments as paymentsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionCard from './components/SubscriptionCard';
import ServersSection from './components/ServersSection';
import PaymentHistory from './components/PaymentHistory';
import PaymentModal from './components/PaymentModal';

type DashTab = 'overview' | 'servers' | 'devices' | 'subscription';

const TABS: [DashTab, string][] = [
  ['overview', 'Обзор'],
  ['servers', 'Серверы'],
  ['devices', 'Устройства'],
  ['subscription', 'Подписка'],
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Б';
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(bytes / 1024 ** 2).toFixed(0)} МБ`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const [dashTab, setDashTab] = useState<DashTab>('overview');
  const [sub, setSub] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [initialPlanId, setInitialPlanId] = useState<string | undefined>();
  const [paymentAlert, setPaymentAlert] = useState<'success' | 'failed' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'success') setPaymentAlert('success');
    if (params.get('payment') === 'failed') setPaymentAlert('failed');
    if (location.state?.openPayment) {
      setInitialPlanId(location.state.openPayment);
      setShowPayment(true);
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, configRes, histRes] = await Promise.allSettled([
        subsApi.getMy(),
        subsApi.getConfig(),
        paymentsApi.getHistory(),
      ]);
      if (subRes.status === 'fulfilled') setSub(subRes.value.data);
      if (configRes.status === 'fulfilled') setConfig(configRes.value.data);
      if (histRes.status === 'fulfilled') setPaymentHistory(histRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  const openPayment = (planId?: string) => {
    setInitialPlanId(planId);
    setShowPayment(true);
  };

  const userAlias = user?.email?.split('@')[0] ?? '';
  const isActive = sub?.status === 'active';
  const firstNode = config?.nodes?.[0];

  const tabStyle = (tab: DashTab): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left',
    padding: '11px 13px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontSize: 14.5, fontFamily: 'inherit', transition: 'all .15s',
    background: dashTab === tab ? 'var(--accent-soft)' : 'transparent',
    color: dashTab === tab ? 'var(--accent-d)' : 'var(--muted)',
    fontWeight: dashTab === tab ? 600 : 500,
  });

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.975 0.004 285)', minHeight: 'calc(100vh - 74px)' }}>
        <style>{`@keyframes ppn-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 24, height: 24, border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'ppn-spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes ppn-spin { to { transform: rotate(360deg); } }`}</style>
      <section style={{ flex: 1, background: 'oklch(0.975 0.004 285)', minHeight: 'calc(100vh - 74px)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '36px 32px 80px', display: 'grid', gridTemplateColumns: '236px 1fr', gap: 36, alignItems: 'start' }}>

          {/* ── Sidebar ── */}
          <aside style={{ position: 'sticky', top: 96 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
              <span style={{
                width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600, color: 'var(--accent-d)', flexShrink: 0,
                textTransform: 'uppercase',
              }}>
                {userAlias.slice(0, 2)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub?.planName?.ru ?? 'Нет подписки'}</div>
              </div>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 14 }}>
              {TABS.map(([key, label]) => (
                <button key={key} onClick={() => setDashTab(key)} style={tabStyle(key)}>{label}</button>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <div>
            {/* Alerts */}
            {paymentAlert === 'success' && (
              <div style={{ padding: '14px 18px', background: 'color-mix(in oklab, oklch(0.66 0.15 152), white 86%)', border: '1px solid color-mix(in oklab, oklch(0.66 0.15 152), white 60%)', borderRadius: 12, marginBottom: 20, fontSize: 14, color: 'oklch(0.35 0.1 152)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Оплата прошла успешно! Подписка активирована.</span>
                <button onClick={() => setPaymentAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px' }}>×</button>
              </div>
            )}
            {paymentAlert === 'failed' && (
              <div style={{ padding: '14px 18px', background: 'color-mix(in oklab, oklch(0.55 0.16 25), white 88%)', border: '1px solid color-mix(in oklab, oklch(0.55 0.16 25), white 60%)', borderRadius: 12, marginBottom: 20, fontSize: 14, color: 'oklch(0.35 0.1 25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Не удалось провести оплату. Попробуйте ещё раз.</span>
                <button onClick={() => setPaymentAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px' }}>×</button>
              </div>
            )}

            {/* ── Overview ── */}
            {dashTab === 'overview' && (
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
                  Добрый день, {userAlias}
                </h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', margin: '6px 0 0', fontWeight: 300 }}>
                  {isActive ? 'Ваше соединение под защитой PPN.' : 'У вас нет активной подписки.'}
                </p>

                {/* Connection card */}
                <div style={{ marginTop: 24, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 9, height: 9, borderRadius: '50%',
                          background: isActive ? 'oklch(0.66 0.15 152)' : 'var(--faint)',
                          boxShadow: isActive ? '0 0 0 4px color-mix(in oklab, oklch(0.66 0.15 152), transparent 82%)' : 'none',
                        }} />
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{isActive ? 'Защищено' : 'Нет подписки'}</span>
                      </div>
                      {sub?.expiresAt && (
                        <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 8 }}>
                          Истекает {new Date(sub.expiresAt).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                    {firstNode && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Сервер</div>
                        <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4, letterSpacing: '-0.01em' }}>{firstNode.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>
                          {firstNode.status === 'connected' ? 'В сети' : 'Недоступен'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                    {isActive ? (
                      <button
                        onClick={() => setDashTab('servers')}
                        style={{ flex: 'none', padding: '14px 20px', borderRadius: 'calc(var(--radius) - 5px)', border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
                      >
                        Серверы
                      </button>
                    ) : (
                      <button
                        onClick={() => openPayment()}
                        style={{ padding: '14px 26px', borderRadius: 'calc(var(--radius) - 5px)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
                      >
                        Подключить
                      </button>
                    )}
                  </div>
                </div>

                {/* 2-card row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginTop: 20 }}>
                  {/* Traffic */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>Трафик</span>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {sub ? `${formatBytes(sub.usedTrafficBytes)} из ${sub.dataLimitGB ? sub.dataLimitGB + ' ГБ' : '∞'}` : '—'}
                      </span>
                    </div>
                    {sub && sub.dataLimitBytes > 0 && (
                      <div style={{ marginTop: 18, height: 6, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, Math.round(sub.usedTrafficBytes / sub.dataLimitBytes * 100))}%`, background: 'var(--accent)', borderRadius: 999, transition: 'width .3s' }} />
                      </div>
                    )}
                    {!sub && <p style={{ fontSize: 14, color: 'var(--faint)', marginTop: 16, marginBottom: 0, fontWeight: 300 }}>Нет активной подписки</p>}
                  </div>

                  {/* Sub mini */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 26, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>Подписка</span>
                    {sub ? (
                      <>
                        <div style={{ marginTop: 18, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{sub.planName?.ru ?? '—'}</div>
                        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4 }}>
                          До {new Date(sub.expiresAt).toLocaleDateString('ru-RU')}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 14, color: 'var(--faint)', marginTop: 18, fontWeight: 300 }}>Нет активной подписки</div>
                    )}
                    <button
                      onClick={() => setDashTab('subscription')}
                      style={{ marginTop: 18, alignSelf: 'flex-start', padding: '10px 16px', background: 'var(--accent-soft)', color: 'var(--accent-d)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Управление
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Servers ── */}
            {dashTab === 'servers' && (
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>Серверы</h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', margin: '6px 0 24px', fontWeight: 300 }}>
                  Выберите локацию для подключения.
                </p>
                <ServersSection
                  subscriptionUrl={config?.subscriptionUrl ?? null}
                  nodes={config?.nodes ?? []}
                />
              </div>
            )}

            {/* ── Devices ── */}
            {dashTab === 'devices' && (
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>Устройства</h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', margin: '6px 0 24px', fontWeight: 300 }}>
                  Управление подключёнными устройствами.
                </p>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '48px 28px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <span style={{ width: 20, height: 20, background: 'var(--accent)', borderRadius: 5 }} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 500, margin: '20px 0 6px' }}>Скоро</p>
                  <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 300, margin: 0 }}>
                    Управление устройствами появится в следующем обновлении.
                  </p>
                </div>
              </div>
            )}

            {/* ── Subscription ── */}
            {dashTab === 'subscription' && (
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>Подписка</h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', margin: '6px 0 24px', fontWeight: 300 }}>
                  Текущий тариф и история платежей.
                </p>
                <SubscriptionCard
                  sub={sub}
                  onRenew={() => openPayment(sub?.planId)}
                  onBuy={() => openPayment()}
                />
                <div style={{ fontSize: 18, fontWeight: 600, margin: '28px 0 16px', letterSpacing: '-0.01em' }}>История платежей</div>
                <PaymentHistory payments={paymentHistory} />
              </div>
            )}
          </div>
        </div>
      </section>

      <PaymentModal
        show={showPayment}
        initialPlanId={initialPlanId}
        onHide={() => { setShowPayment(false); loadData(); }}
      />
    </>
  );
}
