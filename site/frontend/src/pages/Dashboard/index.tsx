import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { subscriptions as subsApi, payments as paymentsApi } from '../../services/api';
import SubscriptionCard from './components/SubscriptionCard';
import ServersSection from './components/ServersSection';
import PaymentHistory from './components/PaymentHistory';
import PaymentModal from './components/PaymentModal';

export default function Dashboard() {
  const { t } = useTranslation();
  const location = useLocation();

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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {paymentAlert === 'success' && (
        <Alert variant="success" dismissible onClose={() => setPaymentAlert(null)}>
          {t('dashboard.payment_success')}
        </Alert>
      )}
      {paymentAlert === 'failed' && (
        <Alert variant="warning" dismissible onClose={() => setPaymentAlert(null)}>
          {t('dashboard.payment_failed')}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <h5 className="fw-bold mb-3">{t('dashboard.subscription')}</h5>
          <SubscriptionCard
            sub={sub}
            onRenew={() => openPayment(sub?.planId)}
            onBuy={() => openPayment()}
          />

          {config && (sub?.status === 'active') && (
            <ServersSection
              subscriptionUrl={config.subscriptionUrl}
              nodes={config.nodes || []}
            />
          )}

          <h5 className="fw-bold mb-3">{t('dashboard.payments')}</h5>
          <PaymentHistory payments={paymentHistory} />
        </Col>
      </Row>

      <PaymentModal
        show={showPayment}
        initialPlanId={initialPlanId}
        onHide={() => {
          setShowPayment(false);
          loadData();
        }}
      />
    </Container>
  );
}
