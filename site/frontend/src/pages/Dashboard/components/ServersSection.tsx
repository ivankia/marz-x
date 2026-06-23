import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

interface Node {
  id: number;
  name: string;
  status: string;
}

interface Props {
  subscriptionUrl: string | null;
  nodes: Node[];
}

export default function ServersSection({ subscriptionUrl, nodes }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [qrNode, setQrNode] = useState<null | string>(null);

  const handleCopy = () => {
    if (!subscriptionUrl) return;
    navigator.clipboard.writeText(subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">{t('dashboard.servers')}</h6>
          <Row className="g-2 mb-4">
            {nodes.map((node) => (
              <Col key={node.id} xs={12} sm={6} md={4}>
                <Card className="border-0 bg-light p-2 text-center">
                  <div className="fw-semibold small">{node.name}</div>
                  <Badge
                    bg={node.status === 'connected' ? 'success' : 'danger'}
                    className="mt-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {node.status === 'connected'
                      ? t('landing.server_online')
                      : t('landing.server_offline')}
                  </Badge>
                </Card>
              </Col>
            ))}
          </Row>

          {subscriptionUrl && (
            <>
              <h6 className="fw-bold mb-2">{t('dashboard.subscription_link')}</h6>
              <div className="d-flex gap-2 align-items-start">
                <code
                  className="flex-grow-1 p-2 bg-light rounded small"
                  style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}
                >
                  {subscriptionUrl}
                </code>
              </div>
              <div className="d-flex gap-2 mt-2">
                <Button variant="outline-secondary" size="sm" onClick={handleCopy}>
                  {copied ? t('dashboard.copied') : t('dashboard.copy')}
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => setQrNode(subscriptionUrl)}>
                  {t('dashboard.show_qr')}
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={!!qrNode} onHide={() => setQrNode(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">{t('dashboard.qr_code')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {qrNode && (
            <>
              <QRCodeSVG value={qrNode} size={220} level="M" includeMargin />
              <p className="text-muted small mt-3 mb-0">{t('dashboard.qr_hint')}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
