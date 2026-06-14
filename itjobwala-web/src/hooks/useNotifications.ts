'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/features/navbar';

export const notifKeys = {
  all:   () => ['notifications'] as const,
  list:  (params: object) => ['notifications', 'list', params] as const,
  count: () => ['notifications', 'count'] as const,
};

export function useNotificationsQuery(params: {
  page?:    number;
  limit?:   number;
  is_read?: boolean;
} = {}) {
  return useQuery({
    queryKey: notifKeys.list(params),
    queryFn:  () => getNotifications(params),
  });
}

export function useNotificationCountQuery(enabled = true) {
  return useQuery({
    queryKey:  notifKeys.count(),
    queryFn:   getNotificationCount,
    enabled,
    refetchInterval: 60_000, // poll every 60s
  });
}

export function useMarkReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: notifKeys.all() });
      qc.invalidateQueries({ queryKey: notifKeys.count() });
    },
  });
}

export function useMarkAllReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: notifKeys.all() });
      qc.invalidateQueries({ queryKey: notifKeys.count() });
    },
  });
}
