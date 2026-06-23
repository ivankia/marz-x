import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await auth.forgotPassword(email).catch(() => {});
    setSent(true);
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: 420 }}>
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4 text-center">{t('auth.forgot_title')}</h4>
          {sent ? (
            <Alert variant="success">{t('auth.forgot_success')}</Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{t('auth.email')}</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                {loading ? '...' : t('auth.forgot_btn')}
              </Button>
            </Form>
          )}
          <p className="text-center mt-3 mb-0 small">
            <Link to="/login">{t('nav.login')}</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
