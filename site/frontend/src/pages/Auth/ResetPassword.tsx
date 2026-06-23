import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

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
      await auth.resetPassword(token, password);
      setSuccess(true);
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
          <h4 className="fw-bold mb-4 text-center">{t('auth.reset_title')}</h4>
          {success ? (
            <>
              <Alert variant="success">{t('auth.reset_success')}</Alert>
              <Button as={Link as any} to="/login" variant="primary" className="w-100">{t('nav.login')}</Button>
            </>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('auth.password')}</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>{t('auth.confirm_password')}</Form.Label>
                  <Form.Control type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? '...' : t('auth.reset_btn')}
                </Button>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
