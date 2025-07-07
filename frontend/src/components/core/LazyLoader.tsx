import React, { Suspense } from 'react';

interface LazyLoaderProps {
  component: React.LazyExoticComponent<any>;
  fallback?: React.ReactNode;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  component: Component,
  fallback = <div>Loading...</div>
}) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
); 