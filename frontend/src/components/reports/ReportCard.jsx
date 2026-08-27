// src/components/reports/ReportCard.jsx
// ----------------------------------------------------------------------------
// Card layout for each report type. Holds title, description, an icon, an
// optional filter section (passed as `children`), and the download button.
// ----------------------------------------------------------------------------

import { Download } from 'lucide-react';
import Button from '../common/Button';

export default function ReportCard({
  icon: Icon,
  title,
  description,
  accent = 'blue',
  loading = false,
  onDownload,
  buttonLabel = 'Download PDF',
  onDownloadCsv,
  children,
}) {
  const accents = {
    blue:   'bg-blue-50 text-blue-600 ring-blue-100',
    amber:  'bg-amber-50 text-amber-600 ring-amber-100',
    green:  'bg-green-50 text-green-600 ring-green-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
  };
  const a = accents[accent] || accents.blue;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${a}`}
        >
          {Icon && <Icon size={22} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {/* Optional filter slot */}
      {children && <div className="mb-3 flex-1">{children}</div>}

      <div className="mt-auto flex gap-2">
        <Button
          icon={Download}
          onClick={onDownload}
          loading={loading}
          className="flex-1"
        >
          {buttonLabel}
        </Button>
        {onDownloadCsv && (
          <Button
            icon={Download}
            variant="secondary"
            onClick={onDownloadCsv}
            loading={loading}
            className="flex-1"
          >
            Download CSV
          </Button>
        )}
      </div>
    </div>
  );
}