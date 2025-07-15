export const queries = {
  notifications: {
    list: (userId: string) => ['notifications', userId],
  },
  tastingLogs: {
    list: (tastingId: string) => ['tasting-logs', tastingId],
  },
}
