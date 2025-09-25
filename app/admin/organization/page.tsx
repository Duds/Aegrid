/**
 * Organizational Settings Admin Page
 *
 * Allows admins to configure organizational settings including
 * weather locations, external API configurations, and regional settings.
 *
 * @fileoverview Admin page for organizational configuration
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle,
    Globe,
    MapPin,
    Plus,
    Save,
    Settings,
    Trash2,
    Wifi,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeatherLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  enabled: boolean;
}

interface OrganizationSettings {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  weatherLocations: WeatherLocation[];
  externalApis: {
    weather: {
      provider: string;
      apiKey: string;
      enabled: boolean;
      refreshInterval: number;
    };
    iot: {
      brokerUrl: string;
      username: string;
      password: string;
      enabled: boolean;
    };
    energy: {
      serverUrl: string;
      username: string;
      password: string;
      enabled: boolean;
    };
    emergency: {
      apiKey: string;
      apiUrl: string;
      enabled: boolean;
    };
  };
  regionalSettings: {
    country: string;
    language: string;
    units: {
      distance: string;
      temperature: string;
      weight: string;
    };
  };
}

/**
 * Organizational Settings Admin Page
 *
 * Provides comprehensive organizational configuration for admins
 * Aligned with The Aegrid Rules - Rule 4: Plan for Tomorrow, Today
 *
 * @component OrganizationSettingsPage
 * @example
 * ```tsx
 * <OrganizationSettingsPage />
 * ```
 * @accessibility
 * - ARIA roles: main, tablist, tabpanel, form
 * - Keyboard navigation: Tab through settings and forms
 * - Screen reader: Announces setting categories and values
 */
export default function OrganizationSettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchOrganizationSettings();
  }, []);

  const fetchOrganizationSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/organization/settings');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch organization settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/organization/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setSuccess('Organization settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save organization settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save organization settings');
    } finally {
      setSaving(false);
    }
  };

  const addWeatherLocation = async () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      setError('Please provide location name, latitude, and longitude');
      return;
    }

    try {
      // Search for location using weather API to validate
      const response = await fetch('/api/external/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search_location',
          location: newLocation.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate location');
      }

      const data = await response.json();

      if (!data.locations || data.locations.length === 0) {
        setError('Location not found. Please check the name and coordinates.');
        return;
      }

      const location: WeatherLocation = {
        id: `location-${Date.now()}`,
        name: newLocation.name,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude),
        isPrimary: settings!.weatherLocations.length === 0,
        enabled: true,
      };

      setSettings(prev => prev ? {
        ...prev,
        weatherLocations: [...prev.weatherLocations, location],
      } : null);

      setNewLocation({ name: '', latitude: '', longitude: '' });
      setError(null);
    } catch (err) {
      console.error('Failed to add location:', err);
      setError(err instanceof Error ? err.message : 'Failed to add location');
    }
  };

  const removeWeatherLocation = (locationId: string) => {
    setSettings(prev => prev ? {
      ...prev,
      weatherLocations: prev.weatherLocations.filter(loc => loc.id !== locationId),
    } : null);
  };

  const setPrimaryLocation = (locationId: string) => {
    setSettings(prev => prev ? {
      ...prev,
      weatherLocations: prev.weatherLocations.map(loc => ({
        ...loc,
        isPrimary: loc.id === locationId,
      })),
    } : null);
  };

  const testApiConnection = async (apiType: string) => {
    try {
      const response = await fetch(`/api/external/${apiType}?health=true`);
      const data = await response.json();

      if (response.ok) {
        setSuccess(`${apiType.toUpperCase()} API connection successful`);
      } else {
        setError(`${apiType.toUpperCase()} API connection failed: ${data.message}`);
      }
    } catch (err) {
      setError(`${apiType.toUpperCase()} API connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading organization settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Failed to load organization settings</p>
          <Button onClick={fetchOrganizationSettings} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Configure organizational settings, locations, and external API integrations
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="locations">Weather Locations</TabsTrigger>
          <TabsTrigger value="apis">External APIs</TabsTrigger>
          <TabsTrigger value="regional">Regional Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic organizational information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Organization Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings(prev => prev ? { ...prev, timezone: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                      <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                      <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                      <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                      <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                      <SelectItem value="Australia/Darwin">Australia/Darwin</SelectItem>
                      <SelectItem value="Australia/Hobart">Australia/Hobart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings(prev => prev ? { ...prev, currency: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings(prev => prev ? { ...prev, dateFormat: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Australian)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Weather Monitoring Locations
              </CardTitle>
              <CardDescription>
                Configure locations for weather monitoring and external weather API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Location */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add New Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationName">Location Name</Label>
                    <Input
                      id="locationName"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sydney CBD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={newLocation.latitude}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="-33.8688"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={newLocation.longitude}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="151.2093"
                    />
                  </div>
                </div>
                <Button onClick={addWeatherLocation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>

              {/* Existing Locations */}
              <div className="space-y-3">
                <h4 className="font-medium">Configured Locations</h4>
                {settings.weatherLocations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No weather locations configured. Add a location above to get started.
                  </p>
                ) : (
                  settings.weatherLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{location.name}</span>
                            {location.isPrimary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                            {!location.enabled && (
                              <Badge variant="secondary">Disabled</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={location.enabled}
                          onCheckedChange={(checked) => {
                            setSettings(prev => prev ? {
                              ...prev,
                              weatherLocations: prev.weatherLocations.map(loc =>
                                loc.id === location.id ? { ...loc, enabled: checked } : loc
                              ),
                            } : null);
                          }}
                        />
                        {!location.isPrimary && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPrimaryLocation(location.id)}
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeWeatherLocation(location.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          {/* Weather API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Weather API Configuration
              </CardTitle>
              <CardDescription>
                Configure OpenWeatherMap API integration for real-time weather data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weatherEnabled">Enable Weather API</Label>
                <Switch
                  id="weatherEnabled"
                  checked={settings.externalApis.weather.enabled}
                  onCheckedChange={(checked) => setSettings(prev => prev ? {
                    ...prev,
                    externalApis: {
                      ...prev.externalApis,
                      weather: { ...prev.externalApis.weather, enabled: checked },
                    },
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weatherApiKey">API Key</Label>
                  <Input
                    id="weatherApiKey"
                    type="password"
                    value={settings.externalApis.weather.apiKey}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        weather: { ...prev.externalApis.weather, apiKey: e.target.value },
                      },
                    } : null)}
                    placeholder="Enter OpenWeatherMap API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weatherRefresh">Refresh Interval (minutes)</Label>
                  <Input
                    id="weatherRefresh"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.externalApis.weather.refreshInterval}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        weather: { ...prev.externalApis.weather, refreshInterval: parseInt(e.target.value) },
                      },
                    } : null)}
                  />
                </div>
              </div>
              <Button onClick={() => testApiConnection('weather')} variant="outline">
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* IoT API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                IoT / MQTT Configuration
              </CardTitle>
              <CardDescription>
                Configure MQTT broker connection for IoT sensor data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="iotEnabled">Enable IoT Integration</Label>
                <Switch
                  id="iotEnabled"
                  checked={settings.externalApis.iot.enabled}
                  onCheckedChange={(checked) => setSettings(prev => prev ? {
                    ...prev,
                    externalApis: {
                      ...prev.externalApis,
                      iot: { ...prev.externalApis.iot, enabled: checked },
                    },
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mqttBroker">MQTT Broker URL</Label>
                  <Input
                    id="mqttBroker"
                    value={settings.externalApis.iot.brokerUrl}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        iot: { ...prev.externalApis.iot, brokerUrl: e.target.value },
                      },
                    } : null)}
                    placeholder="mqtt://broker.hivemq.com:1883"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mqttUsername">Username (optional)</Label>
                  <Input
                    id="mqttUsername"
                    value={settings.externalApis.iot.username}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        iot: { ...prev.externalApis.iot, username: e.target.value },
                      },
                    } : null)}
                    placeholder="MQTT username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mqttPassword">Password (optional)</Label>
                  <Input
                    id="mqttPassword"
                    type="password"
                    value={settings.externalApis.iot.password}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        iot: { ...prev.externalApis.iot, password: e.target.value },
                      },
                    } : null)}
                    placeholder="MQTT password"
                  />
                </div>
              </div>
              <Button onClick={() => testApiConnection('iot')} variant="outline">
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* Energy API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Energy / OPC UA Configuration
              </CardTitle>
              <CardDescription>
                Configure OPC UA server connection for energy system monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="energyEnabled">Enable Energy Integration</Label>
                <Switch
                  id="energyEnabled"
                  checked={settings.externalApis.energy.enabled}
                  onCheckedChange={(checked) => setSettings(prev => prev ? {
                    ...prev,
                    externalApis: {
                      ...prev.externalApis,
                      energy: { ...prev.externalApis.energy, enabled: checked },
                    },
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opcuaServer">OPC UA Server URL</Label>
                  <Input
                    id="opcuaServer"
                    value={settings.externalApis.energy.serverUrl}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        energy: { ...prev.externalApis.energy, serverUrl: e.target.value },
                      },
                    } : null)}
                    placeholder="opc.tcp://localhost:4840"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opcuaUsername">Username (optional)</Label>
                  <Input
                    id="opcuaUsername"
                    value={settings.externalApis.energy.username}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        energy: { ...prev.externalApis.energy, username: e.target.value },
                      },
                    } : null)}
                    placeholder="OPC UA username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opcuaPassword">Password (optional)</Label>
                  <Input
                    id="opcuaPassword"
                    type="password"
                    value={settings.externalApis.energy.password}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      externalApis: {
                        ...prev.externalApis,
                        energy: { ...prev.externalApis.energy, password: e.target.value },
                      },
                    } : null)}
                    placeholder="OPC UA password"
                  />
                </div>
              </div>
              <Button onClick={() => testApiConnection('energy')} variant="outline">
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure regional preferences and units
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={settings.regionalSettings.country}
                    onValueChange={(value) => setSettings(prev => prev ? {
                      ...prev,
                      regionalSettings: { ...prev.regionalSettings, country: value },
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="NZ">New Zealand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.regionalSettings.language}
                    onValueChange={(value) => setSettings(prev => prev ? {
                      ...prev,
                      regionalSettings: { ...prev.regionalSettings, language: value },
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-AU">English (Australia)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-UK">English (UK)</SelectItem>
                      <SelectItem value="en-CA">English (Canada)</SelectItem>
                      <SelectItem value="en-NZ">English (New Zealand)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Units of Measurement</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distanceUnits">Distance</Label>
                    <Select
                      value={settings.regionalSettings.units.distance}
                      onValueChange={(value) => setSettings(prev => prev ? {
                        ...prev,
                        regionalSettings: {
                          ...prev.regionalSettings,
                          units: { ...prev.regionalSettings.units, distance: value },
                        },
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select distance units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (km, m)</SelectItem>
                        <SelectItem value="imperial">Imperial (mi, ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperatureUnits">Temperature</Label>
                    <Select
                      value={settings.regionalSettings.units.temperature}
                      onValueChange={(value) => setSettings(prev => prev ? {
                        ...prev,
                        regionalSettings: {
                          ...prev.regionalSettings,
                          units: { ...prev.regionalSettings.units, temperature: value },
                        },
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select temperature units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightUnits">Weight</Label>
                    <Select
                      value={settings.regionalSettings.units.weight}
                      onValueChange={(value) => setSettings(prev => prev ? {
                        ...prev,
                        regionalSettings: {
                          ...prev.regionalSettings,
                          units: { ...prev.regionalSettings.units, weight: value },
                        },
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg, g)</SelectItem>
                        <SelectItem value="imperial">Imperial (lb, oz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
