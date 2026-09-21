import React from 'react';

export default function Badge({ status, variant, children, icon: Icon, className = "" }) {
  const getBadgeClass = (val) => {
    if (variant) return `badge-${variant}`;
    const s = String(val || "").toLowerCase();
    if (s.includes("avail")) return "badge-available";
    if (s.includes("book")) return "badge-booked";
    if (s.includes("block")) return "badge-blocked";
    if (s.includes("maint")) return "badge-maintenance";
    if (s.includes("conflict") || s.includes("crit") || s.includes("fail")) return "badge-conflict";
    if (s.includes("confirm") || s.includes("success") || s.includes("connect") || s.includes("resolv")) return "badge-confirmed";
    if (s.includes("pend") || s.includes("warn") || s.includes("review")) return "badge-pending";
    if (s.includes("cancel")) return "badge-cancelled";
    return "badge-blocked";
  };

  const badgeClass = getBadgeClass(variant || status);

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {Icon && <Icon size={12} />}
      {children || status}
    </span>
  );
}
