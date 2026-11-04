import "./LoadingSpinner.css";

export function LoadingSpinner({ label }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="spinner-border" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
