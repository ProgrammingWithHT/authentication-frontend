function StatusBanner({ feedback }) {
  return (
    <section className={`status-banner ${feedback.type}`}>{feedback.text}</section>
  );
}

export default StatusBanner;
