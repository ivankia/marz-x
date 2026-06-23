import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/api';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    auth.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-sm border-0 text-center p-5" style={{ maxWidth: 420 }}>
        <h4 className="fw-bold mb-4">{t('auth.verify_title')}</h4>
        {status === 'loading' && <Spinner animation="border" />}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48 }} className="mb-3">✅</div>
            <Alert variant="success">{t('auth.verify_success')}</Alert>
            <Button as={Link as any} to="/login" variant="primary">{t('nav.login')}</Button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48 }} className="mb-3">❌</div>
            <Alert variant="danger">{t('auth.verify_error')}</Alert>
            <Button as={Link as any} to="/login" variant="outline-secondary">{t('nav.login')}</Button>
          </>
        )}
      </Card>
    </Container>
  );
}
