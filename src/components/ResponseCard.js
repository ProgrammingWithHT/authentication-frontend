function ResponseCard({ lastResponse }) {
  return (
    <section className="card response-card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Debug view</p>
          <h2>Latest API response</h2>
        </div>
      </div>
      <pre>{lastResponse}</pre>
    </section>
  );
}

export default ResponseCard;
