// src/components/common/Loader.jsx
// ----------------------------------------------------------------------------
// Centered spinner. Used during the initial auth check and on slow data loads.
// ----------------------------------------------------------------------------

export default function Loader({ fullScreen = false, label = 'Loading...' }) {
  const wrapper = fullScreen
    ? 'flex h-screen w-full items-center justify-center'
    : 'flex w-full items-center justify-center py-10';

  return (
    <div className={wrapper}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
