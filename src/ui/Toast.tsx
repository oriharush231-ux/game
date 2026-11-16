import { useEffect } from 'react';
import { useGame } from '../store/gameStore';
import './Toast.css';

export function ToastHost() {
  const toast = useGame((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => useGame.setState({ toast: null }), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div className="toast-host" role="status" aria-live="polite">
      <div key={toast.id} className={`toast toast--${toast.tone}`}>
        <span className="toast__bar" />
        {toast.text}
      </div>
    </div>
  );
}
