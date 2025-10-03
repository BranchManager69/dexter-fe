import styles from './StatusPage.module.css';

const services = [
  {
    name: 'Dexter Voice',
    status: 'operational' as const,
    description: 'Realtime voice sessions and live call routing.',
    lastIncident: 'No incidents reported in the last 30 days.',
  },
  {
    name: 'Dexter Chat',
    status: 'operational' as const,
    description: 'Multi-agent chat orchestration and MCP hand-offs.',
    lastIncident: 'Last disruption: August 28, 2025 · Resolved in 12 minutes.',
  },
  {
    name: 'MCP Tooling',
    status: 'degraded' as const,
    description: 'Tool catalog, automations, and action queue.',
    lastIncident: 'Investigating elevated queue times for Pump.fun actions.',
  },
];

const statusLabels: Record<(typeof services)[number]['status'], string> = {
  operational: 'Operational',
  degraded: 'Degraded',
};

export default function StatusPage() {
  return (
    <main className="main-content">
      <section className="section">
        <div className={styles.wrapper}>
          <div className={styles.intro}>
            <span className="eyebrow">Live service health</span>
            <h1>Dexter status.</h1>
            <p>
              Track uptime for voice, chat, and MCP orchestration. Subscribe to stay ahead of maintenance windows and incident updates.
            </p>
            <div className={styles.summary}>
              <span className={styles.badge}>All core surfaces are online</span>
              <span className={styles.meta}>Last updated · {new Date().toLocaleString()}</span>
            </div>
          </div>
          <div className={styles.grid}>
            {services.map((service) => (
              <article key={service.name} className={styles.card}>
                <header className={styles.header}>
                  <div>
                    <h2>{service.name}</h2>
                    <p className={styles.desc}>{service.description}</p>
                  </div>
                  <span className={`${styles.status} ${styles[service.status]}`}>{statusLabels[service.status]}</span>
                </header>
                <footer className={styles.meta}>{service.lastIncident}</footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
