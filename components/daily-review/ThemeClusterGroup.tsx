'use client';

import React from 'react';
import { DbNote } from '@/types';
import { ThemeCluster } from '@/types/daily-review';
import { ThemeClusterCard } from './ThemeClusterCard';

interface ThemeClusterGroupProps {
  clusters: ThemeCluster[];
  notesMap: Map<string, DbNote>;
}

export function ThemeClusterGroup({ clusters, notesMap }: ThemeClusterGroupProps) {
  if (clusters.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-sm font-serif text-gray-700 flex items-center gap-2">
        <span className="w-5 h-[1px] bg-morandi-sage/40" />
        主题聚类
        <span className="w-5 h-[1px] bg-morandi-sage/40" />
      </h3>

      <div className="space-y-3">
        {clusters.map((cluster, index) => {
          const clusterNotes = cluster.noteIds
            .map(id => notesMap.get(id))
            .filter((n): n is DbNote => n != null);

          return (
            <ThemeClusterCard
              key={`${cluster.theme}-${index}`}
              theme={cluster.theme}
              summary={cluster.summary}
              notes={clusterNotes}
            />
          );
        })}
      </div>
    </div>
  );
}
