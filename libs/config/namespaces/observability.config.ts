import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const observabilityConfig = registerAs('observability', () => ({
  nodeExporter: {
    host:
      process.env.NODE_EXPORTER_HOST ??
      process.env.NoDE_EXPORTER_HOST ??
      'localhost',
    port: toNumber(process.env.NODE_EXPORTER_PORT, 9100),
  },
  prometheus: {
    host: process.env.PROMETHEUS_HOST ?? 'localhost',
    port: toNumber(process.env.PROMETHEUS_PORT, 9090),
    scrapeInterval: process.env.PROMETHEUS_SCRAPE_INTERVAL ?? '15s',
    scrapeTimeout: process.env.PROMETHEUS_SCRAPE_TIMEOUT ?? '10s',
    scrapeTargets: (process.env.PROMETHEUS_SCRAPE_TARGETS ?? '')
      .split(',')
      .map((target) => target.trim())
      .filter(Boolean),
    baseUrl: process.env.PROMETHEUS_BASE_URL ?? 'http://localhost:9090',
  },
  grafana: {
    host: process.env.GRAFANA_HOST ?? 'localhost',
    port: toNumber(process.env.GRAFANA_PORT, 3000),
    baseUrl: process.env.GRAFANA_BASE_URL ?? 'http://localhost:3000',
    datasource: process.env.GRAFANA_DATASOURCE ?? 'http://prometheus:9090',
    adminUser: process.env.GF_SECURITY_ADMIN_USER ?? 'admin',
    adminPassword: process.env.GF_SECURITY_ADMIN_PASSWORD ?? 'admin',
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
  },
  loki: {
    host: process.env.LOKI_HOST ?? 'localhost',
    port: toNumber(process.env.LOKI_PORT, 3100),
    baseUrl: process.env.LOKI_BASE_URL ?? 'http://localhost:3100',
  },
}));
