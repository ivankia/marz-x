import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

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

const statusVariant: Record<string, string> = {
  confirmed: 'success',
  pending: 'warning',
  canceled: 'secondary',
  chargebacked: 'danger',
};

const METHOD_NAMES: Record<number, string> = {
  2: 'СБП', 10: 'Карта РФ', 11: 'Эквайринг', 12: 'Межд. карта', 13: 'Крипта',
};

export default function PaymentHistory({ payments }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ru' | 'en';

  const statusLabel: Record<string, string> = {
    confirmed: t('dashboard.status_confirmed'),
    pending: t('dashboard.status_pending'),
    canceled: t('dashboard.status_canceled_pay'),
    chargebacked: 'Chargeback',
  };

  if (payments.length === 0) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4 text-center text-muted">
          {t('dashboard.no_payments')}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-0">
        <Table responsive className="mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-4">{t('dashboard.date')}</th>
              <th>{t('payment.plan')}</th>
              <th>{t('dashboard.amount')}</th>
              <th>{t('dashboard.payment_status')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="ps-4 text-muted small">
                  {new Date(p.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
                </td>
                <td className="fw-semibold small">{p.planId}</td>
                <td>{p.amount} {p.currency}</td>
                <td>
                  <Badge bg={statusVariant[p.status] || 'secondary'}>
                    {statusLabel[p.status] || p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
