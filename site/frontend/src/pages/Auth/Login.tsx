import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login({ email, password });
      await login(res.data.accessToken, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.something_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: 420 }}>
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4 text-center">{t('auth.login_title')}</h4>
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
            <div className="text-end mb-3">
              <Link to="/forgot-password" className="small text-muted">{t('auth.forgot_password')}</Link>
            </div>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? '...' : t('auth.login_btn')}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">
            {t('auth.no_account')} <Link to="/register">{t('nav.register')}</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
