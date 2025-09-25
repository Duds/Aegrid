/**
 * Sector-Neutral Dashboard UI
 *
 * Implements comprehensive sector-neutral dashboard for language and template management
 *
 * @fileoverview Sector-neutral dashboard UI component
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDynamicBackgroundStyle, getDynamicTextStyle } from '@/lib/dynamic-styles';
import {
    AlertTriangle,
    Building2,
    CheckCircle,
    Download,
    Edit,
    FileText,
    Globe,
    Languages,
    Plus,
    Settings,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface LanguageMapping {
  councilTerm: string;
  neutralTerm: string;
  description: string;
  category: string;
  sectors: string[];
}

interface SectorConfiguration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
}

interface SectorTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  sector: string;
  category: string;
  enabled: boolean;
}

interface AssetClassification {
  id: string;
  name: string;
  displayName: string;
  description: string;
  sector: string;
  category: string;
  enabled: boolean;
}

export default function SectorNeutralDashboard() {
  const [languageMappings, setLanguageMappings] = useState<LanguageMapping[]>([]);
  const [sectorConfigurations, setSectorConfigurations] = useState<SectorConfiguration[]>([]);
  const [templates, setTemplates] = useState<SectorTemplate[]>([]);
  const [classifications, setClassifications] = useState<AssetClassification[]>([]);
  const [currentSector, setCurrentSector] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('');

  useEffect(() => {
    fetchSectorNeutralData();
  }, []);

  const fetchSectorNeutralData = async () => {
    try {
      setLoading(true);

      // Fetch language mappings
      const languageResponse = await fetch('/api/sector-neutral/language');
      if (!languageResponse.ok) {
        throw new Error('Failed to fetch language mappings');
      }
      const languageData = await languageResponse.json();
      setLanguageMappings(languageData.languageMappings || []);
      setSectorConfigurations(languageData.sectorConfigurations || []);
      setCurrentSector(languageData.currentSector || 'general');

      // Fetch templates
      const templatesResponse = await fetch('/api/sector-neutral/templates');
      if (!templatesResponse.ok) {
        throw new Error('Failed to fetch templates');
      }
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData.templates || []);

      // Fetch classifications
      const classificationsResponse = await fetch('/api/sector-neutral/classifications');
      if (!classificationsResponse.ok) {
        throw new Error('Failed to fetch classifications');
      }
      const classificationsData = await classificationsResponse.json();
      setClassifications(classificationsData.classifications || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSectorChange = async (sectorId: string) => {
    try {
      const response = await fetch('/api/sector-neutral/language/sector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sector');
      }

      setCurrentSector(sectorId);
      setSelectedSector(sectorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sector');
    }
  };

  const translateText = async (text: string) => {
    try {
      const response = await fetch('/api/sector-neutral/language/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          context: {
            sector: currentSector,
            userRole: 'admin',
            context: 'ui',
            language: 'en-AU',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate text');
      }

      const data = await response.json();
      return data.translatedText;
    } catch (err) {
      console.error('Translation error:', err);
      return text;
    }
  };

  const getSectorColor = (sector: string) => {
    const colors = {
      government: '#3B82F6',
      utilities: '#0EA5E9',
      transport: '#8B5CF6',
      healthcare: '#EC4899',
      manufacturing: '#F97316',
      general: '#6B7280',
    };
    return colors[sector as keyof typeof colors] || '#6B7280';
  };

  const getSectorIcon = (sector: string) => {
    const icons = {
      government: '🏛️',
      utilities: '⚡',
      transport: '🚌',
      healthcare: '🏥',
      manufacturing: '🏭',
      general: '🌐',
    };
    return icons[sector as keyof typeof icons] || '🌐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sector-Neutral Platform</h1>

        </div>
        <div className="flex items-center space-x-4">
          <Select value={currentSector} onValueChange={handleSectorChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              {sectorConfigurations.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchSectorNeutralData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Sector Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Current Sector Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{getSectorIcon(currentSector)}</div>
            <div>
              <h3 className="text-lg font-semibold">
                {sectorConfigurations.find(c => c.id === currentSector)?.displayName || 'General'}
              </h3>

            </div>
            <Badge
              variant="outline"
              className="dynamic-bg dynamic-text"
              style={{ ...getDynamicBackgroundStyle(getSectorColor(currentSector)), ...getDynamicTextStyle('white') }}
            >
              {currentSector}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="language" className="space-y-4">
        <TabsList>
          <TabsTrigger value="language">Language Management</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="classifications">Asset Classifications</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Languages className="h-5 w-5 mr-2" />
                  Language Mappings
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </CardTitle>
              <CardDescription>
                Manage terminology mappings between council-specific and sector-neutral terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageMappings.map((mapping) => (
                  <div key={mapping.councilTerm} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{mapping.councilTerm}</h4>

                        </div>
                        <div className="text-2xl">→</div>
                        <div>
                          <h4 className="font-medium">{mapping.neutralTerm}</h4>

                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{mapping.category}</Badge>
                        {mapping.sectors.map((sector) => (
                          <Badge
                            key={sector}
                            variant="secondary"
                            className="dynamic-bg"
                            style={getDynamicBackgroundStyle(getSectorColor(sector))}
                          >
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Sector Templates
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardTitle>
              <CardDescription>
                Manage sector-specific templates and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{template.displayName}</span>
                        <Badge
                          variant="outline"
                          className="dynamic-bg"
                          style={getDynamicBackgroundStyle(getSectorColor(template.sector))}
                        >
                          {template.sector}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{template.category}</Badge>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Asset Classifications
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Classification
                </Button>
              </CardTitle>
              <CardDescription>
                Manage asset classifications for different industry sectors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classifications.map((classification) => (
                  <div key={classification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{classification.displayName}</h4>

                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge
                          variant="outline"
                          className="dynamic-bg"
                          style={getDynamicBackgroundStyle(getSectorColor(classification.sector))}
                        >
                          {classification.sector}
                        </Badge>
                        <Badge variant="secondary">{classification.category}</Badge>
                        {classification.enabled ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Sector Configurations
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </CardTitle>
              <CardDescription>
                Manage sector-specific configurations and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectorConfigurations.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{config.displayName}</span>
                        <Badge
                          variant="outline"
                          className="dynamic-bg"
                          style={getDynamicBackgroundStyle(getSectorColor(config.id))}
                        >
                          {config.id}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {config.enabled ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
