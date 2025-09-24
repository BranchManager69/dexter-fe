import styles from './overlay.module.css';

export type LeaderboardEntry = {
  rank: number;
  key: string;
  name: string;
  symbol: string;
  statusLabel: string;
  statusTone: 'live' | 'warning' | 'offline';
  primaryStat: string;
  secondaryStat: string;
  deltaLabel: string;
  deltaTrend: 'up' | 'down' | 'flat';
  deltaHint: string;
  lastUpdated: string;
  extraLabel?: string | null;
};

export type LeaderboardColumnProps = {
  title: string;
  subtitle: string;
  entries: LeaderboardEntry[];
};

export function LeaderboardColumn({ title, subtitle, entries }: LeaderboardColumnProps) {
  return (
    <div className={styles.leaderboardColumn}>
      <header className={styles.topStreamsHeader}>
        <span className={styles.topStreamsTitle}>{title}</span>
        <span className={styles.topStreamsSort}>{subtitle}</span>
      </header>
      <div className={styles.topStreams}>
        {entries.map((entry) => (
          <article key={entry.key} className={styles.topStreamCard}>
            <div className={styles.topStreamRowPrimary}>
              <span className={styles.topStreamRank}>#{entry.rank}</span>
              <span className={styles.topStreamName}>{entry.name}</span>
              <span className={styles.topStreamSymbol}>{entry.symbol}</span>
              <span
                className={`${styles.topStreamStatus} ${
                  entry.statusTone === 'live'
                    ? styles.topStreamStatusLive
                    : entry.statusTone === 'warning'
                    ? styles.topStreamStatusWarning
                    : styles.topStreamStatusOffline
                }`}
              >
                {entry.statusLabel}
              </span>
              <span className={`${styles.topStreamDelta} ${styles[`topStreamDelta-${entry.deltaTrend}`]}`}>
                {entry.deltaLabel}
              </span>
            </div>
            <div className={styles.topStreamRowSecondary}>
              <span>{entry.primaryStat}</span>
              <span>{entry.secondaryStat}</span>
              <span>{entry.lastUpdated}</span>
              {entry.extraLabel ? <span>{entry.extraLabel}</span> : null}
              <span className={styles.topStreamDeltaHint}>{entry.deltaHint}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
