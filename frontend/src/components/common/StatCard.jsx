import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = "blue", changeText, alert = false, onClick }) {
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' },
    emerald: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    rose: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    indigo: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
    slate: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div 
      className={`card ${alert ? 'border-alert' : ''}`}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        borderColor: alert ? '#f87171' : undefined,
        background: alert ? '#fff5f5' : undefined
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: scheme.bg,
            color: scheme.text,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {value}
        </span>
      </div>

      {changeText && (
        <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {changeText}
        </div>
      )}
    </div>
  );
}
