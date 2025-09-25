/**
 * Emergency Data Formatters
 *
 * Handles various data formats for emergency APIs including
 * JSON, XML, CSV, YAML, GeoJSON, CAP, and EAS formats
 */

export interface EmergencyData {
  alerts: Array<{
    id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: string;
    description: string;
    timestamp: string;
    status: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  resources: Array<{
    id: string;
    type: string;
    name: string;
    location: string;
    status: string;
    contactInfo: {
      phone: string;
      email: string;
    };
  }>;
  metadata: {
    organisationId: string;
    timestamp: string;
    version: string;
    source: string;
  };
}

export class EmergencyDataFormatter {
  static toJSON(data: EmergencyData): string {
    return JSON.stringify({
      ...data,
      dataType: 'Emergency Data',
      format: 'JSON'
    }, null, 2);
  }

  static toXML(data: EmergencyData): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

    const alertsXML = data.alerts.map(alert => `
    <alert>
      <id>${this.escapeXML(alert.id)}</id>
      <type>${this.escapeXML(alert.type)}</type>
      <severity>${this.escapeXML(alert.severity)}</severity>
      <location>${this.escapeXML(alert.location)}</location>
      <description>${this.escapeXML(alert.description)}</description>
      <timestamp>${this.escapeXML(alert.timestamp)}</timestamp>
      <status>${this.escapeXML(alert.status)}</status>
      ${alert.coordinates ? `
      <coordinates>
        <lat>${alert.coordinates.lat}</lat>
        <lng>${alert.coordinates.lng}</lng>
      </coordinates>` : ''}
    </alert>`).join('');

    const resourcesXML = data.resources.map(resource => `
    <resource>
      <id>${this.escapeXML(resource.id)}</id>
      <type>${this.escapeXML(resource.type)}</type>
      <name>${this.escapeXML(resource.name)}</name>
      <location>${this.escapeXML(resource.location)}</location>
      <status>${this.escapeXML(resource.status)}</status>
      <contact_info>
        <phone>${this.escapeXML(resource.contactInfo.phone)}</phone>
        <email>${this.escapeXML(resource.contactInfo.email)}</email>
      </contact_info>
    </resource>`).join('');

    return `${xmlHeader}
<emergency_data>
  <metadata>
    <timestamp>${this.escapeXML(data.metadata.timestamp)}</timestamp>
    <version>${this.escapeXML(data.metadata.version)}</version>
    <source>${this.escapeXML(data.metadata.source)}</source>
    <organisation_id>${this.escapeXML(data.metadata.organisationId)}</organisation_id>
  </metadata>
  <alerts>${alertsXML}
  </alerts>
  <resources>${resourcesXML}
  </resources>
</emergency_data>`;
  }

  static toCSV(data: EmergencyData): string {
    const alertsHeaders = 'ID,Type,Severity,Location,Description,Timestamp,Status,Latitude,Longitude\n';
    const alertsCSV = data.alerts.map(alert =>
      `${alert.id},${alert.type},${alert.severity},${alert.location},${alert.description},${alert.timestamp},${alert.status},${alert.coordinates?.lat || ''},${alert.coordinates?.lng || ''}`
    ).join('\n');

    const resourcesHeaders = '\n\nResource ID,Type,Name,Location,Status,Phone,Email\n';
    const resourcesCSV = data.resources.map(resource =>
      `${resource.id},${resource.type},${resource.name},${resource.location},${resource.status},${resource.contactInfo.phone},${resource.contactInfo.email}`
    ).join('\n');

    return alertsHeaders + alertsCSV + resourcesHeaders + resourcesCSV;
  }

  static toYAML(data: EmergencyData): string {
    const yamlContent = `---
dataType: Emergency Data
format: YAML
metadata:
  timestamp: ${data.metadata.timestamp}
  version: ${data.metadata.version}
  source: ${data.metadata.source}
  organisationId: ${data.metadata.organisationId}

alerts:
${data.alerts.map(alert => `  - id: ${alert.id}
    type: ${alert.type}
    severity: ${alert.severity}
    location: ${alert.location}
    description: ${alert.description}
    timestamp: ${alert.timestamp}
    status: ${alert.status}${alert.coordinates ? `
    coordinates:
      lat: ${alert.coordinates.lat}
      lng: ${alert.coordinates.lng}` : ''}`).join('\n')}

resources:
${data.resources.map(resource => `  - id: ${resource.id}
    type: ${resource.type}
    name: ${resource.name}
    location: ${resource.location}
    status: ${resource.status}
    contactInfo:
      phone: ${resource.contactInfo.phone}
      email: ${resource.contactInfo.email}`).join('\n')}
`;
    return yamlContent;
  }

  static toGeoJSON(data: EmergencyData): string {
    const features = data.alerts
      .filter(alert => alert.coordinates)
      .map(alert => ({
        type: 'Feature',
        properties: {
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          location: alert.location,
          description: alert.description,
          timestamp: alert.timestamp,
          status: alert.status,
        },
        geometry: {
          type: 'Point',
          coordinates: [alert.coordinates!.lng, alert.coordinates!.lat]
        }
      }));

    const geoJSON = {
      type: 'FeatureCollection',
      metadata: {
        dataType: 'Emergency Data',
        format: 'GeoJSON',
        timestamp: data.metadata.timestamp,
        version: data.metadata.version,
        source: data.metadata.source,
        organisationId: data.metadata.organisationId,
      },
      features
    };

    return JSON.stringify(geoJSON, null, 2);
  }

  static toCAP(data: EmergencyData): string {
    const capAlerts = data.alerts.map(alert => ({
      identifier: alert.id,
      sender: 'Aegrid Emergency System',
      sent: alert.timestamp,
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: [{
        language: 'en-AU',
        category: ['Infrastructure'],
        event: alert.type,
        urgency: this.getCAPUrgency(alert.severity),
        severity: this.getCAPSeverity(alert.severity),
        certainty: 'Observed',
        headline: `Emergency Alert: ${alert.type}`,
        description: alert.description,
        area: [{
          areaDesc: alert.location,
          ...(alert.coordinates && {
            polygon: [[
              [alert.coordinates.lng - 0.01, alert.coordinates.lat - 0.01],
              [alert.coordinates.lng + 0.01, alert.coordinates.lat - 0.01],
              [alert.coordinates.lng + 0.01, alert.coordinates.lat + 0.01],
              [alert.coordinates.lng - 0.01, alert.coordinates.lat + 0.01],
              [alert.coordinates.lng - 0.01, alert.coordinates.lat - 0.01]
            ]]
          })
        }],
      }]
    }));

    const capDocument = {
      dataType: 'CAP (Common Alerting Protocol)',
      timestamp: data.metadata.timestamp,
      alerts: capAlerts
    };

    return JSON.stringify(capDocument, null, 2);
  }

  static toEAS(data: EmergencyData): string {
    const easAlerts = data.alerts.map(alert => ({
      header: 'ZCZC-EAS-EMR-001+00-0000000-',
      originator: 'Aegrid Emergency System',
      eventCode: 'EMR',
      eventType: 'Emergency',
      urgency: alert.severity === 'CRITICAL' ? 'Immediate' : 'Expected',
      severity: alert.severity === 'CRITICAL' ? 'Extreme' : 'Severe',
      certainty: 'Observed',
      area: alert.location,
      message: alert.description,
      timestamp: alert.timestamp,
      expires: new Date(new Date(alert.timestamp).getTime() + 3600000).toISOString(), // 1 hour
    }));

    const easDocument = {
      dataType: 'EAS (Emergency Alert System)',
      timestamp: data.metadata.timestamp,
      alerts: easAlerts
    };

    return JSON.stringify(easDocument, null, 2);
  }

  private static escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private static getCAPUrgency(severity: string): string {
    const urgencyMap: Record<string, string> = {
      'LOW': 'Future',
      'MEDIUM': 'Expected',
      'HIGH': 'Immediate',
      'CRITICAL': 'Immediate',
    };
    return urgencyMap[severity] || 'Expected';
  }

  private static getCAPSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'LOW': 'Minor',
      'MEDIUM': 'Moderate',
      'HIGH': 'Severe',
      'CRITICAL': 'Extreme',
    };
    return severityMap[severity] || 'Moderate';
  }

  static getContentType(format: string): string {
    const contentTypes: Record<string, string> = {
      'json': 'application/json',
      'xml': 'application/xml',
      'csv': 'text/csv',
      'yaml': 'text/yaml',
      'yml': 'text/yaml',
      'geojson': 'application/geo+json',
      'cap': 'application/json',
      'eas': 'application/json',
    };
    return contentTypes[format.toLowerCase()] || 'application/json';
  }

  static isValidFormat(format: string): boolean {
    const validFormats = ['json', 'xml', 'csv', 'yaml', 'yml', 'geojson', 'cap', 'eas'];
    return validFormats.includes(format.toLowerCase());
  }

  static format(data: EmergencyData, format: string): string {
    const normalizedFormat = format.toLowerCase();

    if (!this.isValidFormat(normalizedFormat)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    switch (normalizedFormat) {
      case 'json':
        return this.toJSON(data);
      case 'xml':
        return this.toXML(data);
      case 'csv':
        return this.toCSV(data);
      case 'yaml':
      case 'yml':
        return this.toYAML(data);
      case 'geojson':
        return this.toGeoJSON(data);
      case 'cap':
        return this.toCAP(data);
      case 'eas':
        return this.toEAS(data);
      default:
        return this.toJSON(data);
    }
  }
}
