'use client'

import { Badge } from '@promo/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@promo/components/ui/sheet'
import { Skeleton } from '@promo/components/ui/skeleton'
import { tastingStatusColors } from '@promo/constants/tasting-status-colors'
import { tastingStatusMap } from '@promo/constants/tasting-status-map'
import { useTastingLogs } from '@promo/hooks/use-tasting-logs'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import { Activity, Clock, FileText, History } from 'lucide-react'
import { ReactNode } from 'react'

interface TastingLogsSheetProps {
  tastingId: string
  children: ReactNode
  onClose?: () => void
}

export function TastingLogsSheet({
  tastingId,
  children,
  onClose,
}: TastingLogsSheetProps) {
  const { data: logs, isLoading, error } = useTastingLogs(tastingId)

  console.log(error)

  return (
    <Sheet
      onOpenChange={(openState) => {
        if (!openState) {
          onClose?.()
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5" />
            Histórico de Logs
          </SheetTitle>
          <SheetDescription>
            Visualize o histórico de mudanças de status da degustação #
            {tastingId}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-4">
          {isLoading && (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              Erro ao carregar os logs. Tente novamente mais tarde.
            </div>
          )}

          {logs && (
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Nenhum log encontrado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Esta degustação ainda não possui histórico de mudanças
                  </p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={cn(
                      'relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
                      'hover:bg-muted/50 hover:border-border',
                      index === 0 && 'ring-2 ring-primary/10 border-primary/20',
                    )}
                  >
                    {/* Timeline line */}
                    {index < logs.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                    )}

                    {/* Status icon */}
                    <div className="flex items-center justify-center size-10 rounded-full bg-muted border-2 border-background">
                      <Activity className="size-4 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              Status alterado para:
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                tastingStatusColors[log.status],
                              )}
                            >
                              {tastingStatusMap[log.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            <span>
                              {dayjsApi(log.createdAt).format(
                                'DD/MM/YYYY HH:mm',
                              )}
                            </span>
                            <span>•</span>
                            <span>{dayjsApi(log.createdAt).fromNow()}</span>
                          </div>
                        </div>

                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>

                      {/* User info */}
                      <div className="text-xs text-muted-foreground">
                        Por: {log.createdBy}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
