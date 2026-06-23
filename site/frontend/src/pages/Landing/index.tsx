import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { plans as plansApi, nodes as nodesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

interface NodeStatus {
  id: number;
  name: string;
  address: string;
  status: string;
}

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lang = i18n.language as 'ru' | 'en';

  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [nodesList, setNodesList] = useState<NodeStatus[]>([]);
  const [nodesLoading, setNodesLoading] = useState(true);

  useEffect(() => {
    plansApi.getAll().then((r) => setPlansList(r.data)).catch(() => {});
    nodesApi.getStatus()
      .then((r) => setNodesList(r.data))
      .catch(() => {})
      .finally(() => setNodesLoading(false));
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (user) {
      navigate('/dashboard', { state: { openPayment: planId } });
    } else {
      navigate('/register', { state: { planId } });
    }
  };

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', minHeight: '60vh' }}
        className="d-flex align-items-center text-white">
        <Container className="py-5 text-center">
          <h1 className="display-4 fw-bold mb-3">{t('landing.hero_title')}</h1>
          <p className="lead mb-4 text-light opacity-75">{t('landing.hero_subtitle')}</p>
          <Button size="lg" variant="primary" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('landing.cta')}
          </Button>
        </Container>
      </div>

      {/* Plans */}
      <div id="plans" className="py-5 bg-light">
        <Container>
          <h2 className="text-center fw-bold mb-5">{t('landing.plans_title')}</h2>
          <Row className="justify-content-center g-4">
            {plansList.map((plan) => (
              <Col key={plan.id} xs={12} sm={10} md={4}>
                <Card
                  className={`h-100 shadow-sm border-0 ${plan.popular ? 'border-primary border-2' : ''}`}
                  style={{ borderRadius: 16, overflow: 'hidden', border: plan.popular ? '2px solid #0d6efd' : undefined }}
                >
                  {plan.popular && (
                    <div className="text-center bg-primary py-1">
                      <small className="text-white fw-bold">{t('landing.popular')}</small>
                    </div>
                  )}
                  <Card.Body className="p-4 d-flex flex-column">
                    <h4 className="fw-bold">{plan.name[lang] || plan.name.ru}</h4>
                    <div className="my-3">
                      <span className="display-5 fw-bold">{plan.price} ₽</span>
                      <span className="text-muted ms-1">{t('landing.per_month')}</span>
                    </div>
                    <ul className="list-unstyled flex-grow-1">
                      {(plan.features[lang] || plan.features.ru).map((f, i) => (
                        <li key={i} className="mb-2">
                          <span className="text-success me-2">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.popular ? 'primary' : 'outline-primary'}
                      className="mt-3 w-100"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {t('landing.select_plan')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Servers */}
      <div className="py-5">
        <Container>
          <h2 className="text-center fw-bold mb-4">{t('landing.servers_title')}</h2>
          {nodesLoading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Row className="justify-content-center g-3">
              {nodesList.length === 0 ? (
                <Col xs="auto"><p className="text-muted text-center">—</p></Col>
              ) : (
                nodesList.map((node) => (
                  <Col key={node.id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="border-0 shadow-sm text-center p-3">
                      <div className="mb-2" style={{ fontSize: 32 }}>
                        {node.status === 'connected' ? '🟢' : '🔴'}
                      </div>
                      <div className="fw-semibold">{node.name}</div>
                      <Badge bg={node.status === 'connected' ? 'success' : 'danger'} className="mt-1">
                        {node.status === 'connected' ? t('landing.server_online') : t('landing.server_offline')}
                      </Badge>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}
        </Container>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-dark text-center text-muted">
        <Container>
          <small>© {new Date().getFullYear()} VPN Service</small>
        </Container>
      </footer>
    </>
  );
}
