import React from 'react';
import { Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface Sub {
  planId: string;
  planName: { ru: string; en: string };
  status: string;
  expiresAt: string;
  usedTrafficBytes: number;
  dataLimitBytes: number;
  dataLimitGB: number | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)} MB`;
}

interface Props {
  sub: Sub | null;
  onRenew: () => void;
  onBuy: () => void;
}

export default function SubscriptionCard({ sub, onRenew, onBuy }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ru' | 'en';

  if (!sub) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4 text-center">
          <div style={{ fontSize: 48 }} className="mb-3">🔒</div>
          <p className="text-muted mb-3">{t('dashboard.no_subscription')}</p>
          <Button variant="primary" onClick={onBuy}>{t('dashboard.buy')}</Button>
        </Card.Body>
      </Card>
    );
  }

  const statusMap: Record<string, string> = {
    active: t('dashboard.status_active'),
    expired: t('dashboard.status_expired'),
    canceled: t('dashboard.status_canceled'),
  };

  const statusVariant: Record<string, string> = {
    active: 'success', expired: 'danger', canceled: 'secondary',
  };

  const usedPct = sub.dataLimitBytes > 0
    ? Math.min(100, Math.round((sub.usedTrafficBytes / sub.dataLimitBytes) * 100))
    : 0;

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="fw-bold mb-1">{sub.planName[lang] || sub.planName.ru}</h5>
            <Badge bg={statusVariant[sub.status] || 'secondary'}>{statusMap[sub.status] || sub.status}</Badge>
          </div>
          <Button variant="outline-primary" size="sm" onClick={onRenew}>{t('dashboard.renew')}</Button>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <small className="text-muted d-block">{t('dashboard.expires')}</small>
            <strong>{new Date(sub.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</strong>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">{t('dashboard.traffic_used')}</small>
            <strong>
              {formatBytes(sub.usedTrafficBytes)}
              {sub.dataLimitGB ? ` / ${sub.dataLimitGB} GB` : ` / ${t('dashboard.unlimited')}`}
            </strong>
          </div>
        </div>

        {sub.dataLimitBytes > 0 && (
          <ProgressBar
            now={usedPct}
            variant={usedPct > 80 ? 'danger' : usedPct > 50 ? 'warning' : 'success'}
            label={`${usedPct}%`}
            style={{ height: 8 }}
          />
        )}
      </Card.Body>
    </Card>
  );
}
