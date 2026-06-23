import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { plans as plansApi, payments as paymentsApi } from '../../../services/api';

interface Plan {
  id: string;
  name: { ru: string; en: string };
  price: number;
  currency: string;
  dataLimitGB: number | null;
}

const PAYMENT_METHODS = [
  { id: 2, key: 'sbp' },
  { id: 10, key: 'card_ru' },
  { id: 11, key: 'card_acquiring' },
  { id: 12, key: 'international' },
  { id: 13, key: 'crypto' },
];

interface Props {
  show: boolean;
  initialPlanId?: string;
  onHide: () => void;
}

export default function PaymentModal({ show, initialPlanId, onHide }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ru' | 'en';

  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlanId || '');
  const [selectedMethod, setSelectedMethod] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    plansApi.getAll().then((r) => {
      setPlansList(r.data);
      if (!selectedPlan && r.data.length > 0) setSelectedPlan(initialPlanId || r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (initialPlanId) setSelectedPlan(initialPlanId);
  }, [initialPlanId]);

  const currentPlan = plansList.find((p) => p.id === selectedPlan);

  const handlePay = async () => {
    if (!selectedPlan) return;
    setError('');
    setLoading(true);
    try {
      const res = await paymentsApi.create(selectedPlan, selectedMethod);
      window.location.href = res.data.redirectUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.something_wrong'));
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('payment.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t('payment.plan')}</Form.Label>
          <ListGroup>
            {plansList.map((plan) => (
              <ListGroup.Item
                key={plan.id}
                action
                active={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{plan.name[lang] || plan.name.ru}</span>
                <Badge bg={selectedPlan === plan.id ? 'light' : 'secondary'} text="dark">
                  {plan.price} ₽
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t('payment.method')}</Form.Label>
          {PAYMENT_METHODS.map((m) => (
            <Form.Check
              key={m.id}
              type="radio"
              id={`method-${m.id}`}
              label={t(`payment.${m.key}`)}
              checked={selectedMethod === m.id}
              onChange={() => setSelectedMethod(m.id)}
              className="mb-1"
            />
          ))}
        </Form.Group>

        {currentPlan && (
          <div className="p-3 bg-light rounded">
            <strong>{t('payment.amount')}:</strong>{' '}
            <span className="fs-5 fw-bold">{currentPlan.price} ₽</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>{t('payment.cancel')}</Button>
        <Button variant="primary" onClick={handlePay} disabled={loading || !selectedPlan}>
          {loading ? <Spinner size="sm" animation="border" /> : t('payment.pay_btn')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
