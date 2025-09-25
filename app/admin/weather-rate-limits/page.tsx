/**
 * Weather Rate Limit Admin Page
 *
 * Administrative interface for monitoring and managing weather API rate limits.
 * Provides real-time status updates and manual reset capabilities.
 *
 * @fileoverview Weather rate limit administration page
 */

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherRateLimitAdmin from '@/components/admin/weather-rate-limit-admin';

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function WeatherRateLimitAdminPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Weather Rate Limit Administration</h1>
        <p className="text-muted-foreground">
          Monitor and manage weather API rate limits across all locations. 
          Rate limits ensure minimal external API usage with 15-minute intervals per location.
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <WeatherRateLimitAdmin />
      </Suspense>
    </div>
  );
}
