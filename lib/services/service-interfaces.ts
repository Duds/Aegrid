/**
 * Service Interface Definitions
 *
 * This module defines abstract interfaces for all major services in Aegrid.
 * These interfaces allow for different implementations based on deployment tier.
 */

export interface DatabaseService {
  connect(config: DatabaseConfig): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  transaction<T>(operation: (tx: Transaction) => Promise<T>): Promise<T>;
  isConnected(): boolean;
  getConnectionInfo(): ConnectionInfo;
}

export interface Transaction {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface ConnectionInfo {
  host: string;
  port: number;
  database: string;
  ssl: boolean;
  poolSize: number;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  url: string;
  poolSize?: number;
  ssl?: boolean;
  rls?: boolean;
}

export interface AuthService {
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  authorize(user: User, resource: Resource): Promise<boolean>;
  getProviders(): AuthProvider[];
  refreshToken(token: string): Promise<AuthResult>;
  revokeToken(token: string): Promise<void>;
}

export interface AuthCredentials {
  email?: string;
  password?: string;
  provider?: string;
  token?: string;
  mfaToken?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  mfaRequired?: boolean;
  error?: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'credentials' | 'oauth' | 'saml' | 'ldap';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  organisationId?: string;
  organisation?: Organisation;
  isActive: boolean;
  lastLoginAt?: Date;
  mfaEnabled: boolean;
}

export interface Organisation {
  id: string;
  name: string;
  tier: string;
  features: Record<string, any>;
  limits: Record<string, any>;
}

export interface Resource {
  type: string;
  id: string;
  organisationId?: string;
  permissions: string[];
}

export interface StorageService {
  upload(file: File, path: string, metadata?: FileMetadata): Promise<UploadResult>;
  download(path: string): Promise<DownloadResult>;
  delete(path: string): Promise<void>;
  list(prefix: string): Promise<FileInfo[]>;
  getUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export interface File {
  name: string;
  content: Buffer | string;
  size: number;
  type: string;
}

export interface FileMetadata {
  organisationId?: string;
  userId?: string;
  contentType?: string;
  tags?: Record<string, string>;
}

export interface UploadResult {
  path: string;
  url: string;
  size: number;
  etag?: string;
}

export interface DownloadResult {
  content: Buffer;
  metadata: FileMetadata;
  size: number;
  contentType: string;
}

export interface FileInfo {
  path: string;
  size: number;
  lastModified: Date;
  contentType: string;
  metadata?: FileMetadata;
}

export interface AnalyticsService {
  track(event: AnalyticsEvent): Promise<void>;
  query(metrics: MetricsQuery): Promise<AnalyticsResult>;
  export(data: ExportRequest): Promise<ExportResult>;
  getDashboardData(filters: DashboardFilters): Promise<DashboardData>;
}

export interface AnalyticsEvent {
  type: string;
  userId?: string;
  organisationId?: string;
  properties: Record<string, any>;
  timestamp?: Date;
}

export interface MetricsQuery {
  metric: string;
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
}

export interface AnalyticsResult {
  data: any[];
  total: number;
  aggregations?: Record<string, any>;
}

export interface ExportRequest {
  type: 'csv' | 'json' | 'xlsx';
  filters: Record<string, any>;
  columns: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportResult {
  url: string;
  expiresAt: Date;
  size: number;
}

export interface DashboardFilters {
  organisationId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  assetTypes?: string[];
  userRoles?: string[];
}

export interface DashboardData {
  metrics: Record<string, number>;
  charts: ChartData[];
  tables: TableData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
}

export interface TableData {
  title: string;
  columns: string[];
  rows: any[][];
  total: number;
}

export interface NotificationService {
  sendEmail(to: string, subject: string, body: string, options?: EmailOptions): Promise<void>;
  sendSMS(to: string, message: string, options?: SMSOptions): Promise<void>;
  sendPush(userId: string, title: string, body: string, data?: Record<string, any>): Promise<void>;
  scheduleNotification(notification: ScheduledNotification): Promise<void>;
  cancelNotification(notificationId: string): Promise<void>;
}

export interface EmailOptions {
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Attachment[];
  template?: string;
  variables?: Record<string, any>;
}

export interface SMSOptions {
  from?: string;
  template?: string;
  variables?: Record<string, any>;
}

export interface Attachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface ScheduledNotification {
  id: string;
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  scheduledFor: Date;
  options?: Record<string, any>;
}

export interface IntegrationService {
  execute(integration: Integration, data: any): Promise<IntegrationResult>;
  testConnection(integration: Integration): Promise<boolean>;
  getSchema(integration: Integration): Promise<IntegrationSchema>;
  validateData(integration: Integration, data: any): Promise<ValidationResult>;
}

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'file' | 'database';
  enabled: boolean;
  config: Record<string, any>;
  organisationId?: string;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}

export interface IntegrationSchema {
  fields: SchemaField[];
  required: string[];
  optional: string[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface MonitoringService {
  track(event: MonitoringEvent): void;
  incrementCounter(name: string, tags?: Record<string, string>): void;
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  recordGauge(name: string, value: number, tags?: Record<string, string>): void;
  createSpan(name: string, tags?: Record<string, string>): Span;
}

export interface MonitoringEvent {
  type: string;
  organisationId?: string;
  userId?: string;
  properties: Record<string, any>;
  timestamp?: Date;
}

export interface Span {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  tags: Record<string, string>;
  logs: LogEntry[];
  finish(): void;
  addTag(key: string, value: string): void;
  addLog(message: string, fields?: Record<string, any>): void;
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  fields?: Record<string, any>;
}

/**
 * Service Factory Interface
 */
export interface ServiceFactory {
  createDatabaseService(config: DatabaseConfig): DatabaseService;
  createAuthService(config: AuthConfig): AuthService;
  createStorageService(config: StorageConfig): StorageService;
  createAnalyticsService(config: AnalyticsConfig): AnalyticsService;
  createNotificationService(): NotificationService;
  createIntegrationService(): IntegrationService;
  createMonitoringService(): MonitoringService;
}

export interface AuthConfig {
  type: 'nextauth' | 'saml' | 'ldap' | 'oauth';
  providers: string[];
  saml?: {
    entryPoint: string;
    issuer: string;
    cert: string;
  };
  ldap?: {
    url: string;
    bindDN: string;
    bindCredentials: string;
    searchBase: string;
  };
}

export interface StorageConfig {
  type: 'azure-blob' | 'azure-blob-isolated' | 'local-file' | 's3';
  connectionString?: string;
  basePath?: string;
  container?: string;
}

export interface AnalyticsConfig {
  type: 'shared' | 'isolated' | 'local' | 'disabled';
  endpoint?: string;
  apiKey?: string;
}
