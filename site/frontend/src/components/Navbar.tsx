import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function AppNavbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    const next = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(next);
    if (user) {
      import('../services/api').then(({ users }) => users.updateLang(next));
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          🔒 VPN
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center gap-2">
            <Nav.Link as={Link} to="/#plans">{t('nav.plans')}</Nav.Link>

            <Button variant="outline-light" size="sm" onClick={toggleLang}>
              {i18n.language === 'ru' ? 'EN' : 'RU'}
            </Button>

            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">{t('nav.dashboard')}</Nav.Link>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">{t('nav.login')}</Nav.Link>
                <Button as={Link as any} to="/register" variant="primary" size="sm">
                  {t('nav.register')}
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
