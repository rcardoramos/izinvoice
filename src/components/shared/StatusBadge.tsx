import React from 'react';
import { DocumentStatus, DailySummaryStatus, STATUS_LABELS } from '@/types/enums';
import { CheckCircle2, AlertCircle, Clock, FileText, Ban, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus | DailySummaryStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Map colors and icons
  let bgClass = '';
  let textClass = '';
  let icon: React.ReactNode = null;
  let label = STATUS_LABELS[status as DocumentStatus] || status;

  switch (status) {
    case 'accepted':
      bgClass = 'bg-emerald-500/10 border-emerald-500/20';
      textClass = 'text-emerald-500';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      break;
    case 'rejected':
      bgClass = 'bg-rose-500/10 border-rose-500/20';
      textClass = 'text-rose-500';
      icon = <AlertCircle className="w-3.5 h-3.5" />;
      break;
    case 'failed':
      bgClass = 'bg-red-500/10 border-red-500/20';
      textClass = 'text-red-500';
      icon = <AlertCircle className="w-3.5 h-3.5" />;
      break;
    case 'signed':
      bgClass = 'bg-amber-500/10 border-amber-500/20';
      textClass = 'text-amber-500';
      icon = <FileText className="w-3.5 h-3.5" />;
      break;
    case 'submitted':
    case 'processing':
      bgClass = 'bg-blue-500/10 border-blue-500/20';
      textClass = 'text-blue-500';
      icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
      label = status === 'processing' ? 'Procesando' : 'Enviado';
      break;
    case 'voided':
      bgClass = 'bg-zinc-500/10 border-zinc-500/20';
      textClass = 'text-zinc-500';
      icon = <Ban className="w-3.5 h-3.5" />;
      break;
    case 'observed':
      bgClass = 'bg-yellow-500/10 border-yellow-500/20';
      textClass = 'text-yellow-500';
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    case 'draft':
    default:
      bgClass = 'bg-zinc-500/10 border-zinc-500/20';
      textClass = 'text-zinc-400';
      icon = <Clock className="w-3.5 h-3.5" />;
      label = 'Borrador';
      break;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bgClass} ${textClass}`}
      title={`SUNAT: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
