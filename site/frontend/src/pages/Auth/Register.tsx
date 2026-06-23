import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError(t('auth.password_min')); return; }
    if (password !== confirm) { setError(t('auth.passwords_mismatch')); return; }
    setLoading(true);
    try {
      await auth.register({ email, password, lang: i18n.language });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.something_wrong'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Card className="shadow-sm border-0 text-center p-5" style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 48 }} className="mb-3">✉️</div>
          <h5 className="fw-bold mb-2">{t('auth.check_email')}</h5>
          <p className="text-muted small">{email}</p>
          <Button variant="link" size="sm" onClick={() => auth.resendVerification(email)}>
            {t('auth.resend')}
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: 420 }}>
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4 text-center">{t('auth.register_title')}</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.email')}</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.password')}</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>{t('auth.confirm_password')}</Form.Label>
              <Form.Control type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? '...' : t('auth.register_btn')}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">
            {t('auth.have_account')} <Link to="/login">{t('nav.login')}</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
