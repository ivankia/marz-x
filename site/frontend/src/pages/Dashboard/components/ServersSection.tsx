import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from 'react-bootstrap';

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
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const handleCopy = () => {
    if (!subscriptionUrl) return;
    navigator.clipboard.writeText(subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Nodes list */}
      {nodes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {nodes.map((node) => {
            const online = node.status === 'connected';
            return (
              <div
                key={node.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    background: online ? 'oklch(0.66 0.15 152)' : 'var(--faint)',
                    boxShadow: online ? '0 0 0 3px color-mix(in oklab, oklch(0.66 0.15 152), transparent 82%)' : 'none',
                  }} />
                  <span style={{ fontSize: 15.5, fontWeight: 500 }}>{node.name}</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                  color: online ? 'oklch(0.58 0.13 152)' : 'var(--faint)',
                  background: online ? 'color-mix(in oklab, oklch(0.66 0.15 152), white 86%)' : 'oklch(0.96 0.005 285)',
                }}>
                  {online ? 'В сети' : 'Офлайн'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription URL */}
      {subscriptionUrl && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 26 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Ссылка на подписку</div>
          <div style={{ padding: '12px 14px', background: 'oklch(0.975 0.004 285)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', wordBreak: 'break-all', lineHeight: 1.5 }}>
            {subscriptionUrl}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              onClick={handleCopy}
              style={{ padding: '10px 18px', background: copied ? 'var(--accent-soft)' : 'transparent', color: copied ? 'var(--accent-d)' : 'var(--text)', border: '1px solid var(--line-strong)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
            >
              {copied ? 'Скопировано' : 'Копировать'}
            </button>
            <button
              onClick={() => setQrOpen(true)}
              style={{ padding: '10px 18px', background: 'var(--accent-soft)', color: 'var(--accent-d)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}
            >
              QR-код
            </button>
          </div>
        </div>
      )}

      {/* QR modal */}
      <Modal show={qrOpen} onHide={() => setQrOpen(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">QR-код подписки</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {subscriptionUrl && (
            <>
              <QRCodeSVG value={subscriptionUrl} size={220} level="M" includeMargin />
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 16, marginBottom: 0 }}>
                Отсканируйте для импорта в VPN-клиент
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
