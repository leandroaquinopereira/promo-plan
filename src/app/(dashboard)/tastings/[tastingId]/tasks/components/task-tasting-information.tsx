import type { Tasting } from '@promo/types/firebase'
import { Badge } from '@promo/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Separator } from '@promo/components/ui/separator'
import { dayjsApi } from '@promo/lib/dayjs'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { getUserInitials } from '@promo/utils/get-user-initials'
import { Building2, Calendar, MapPin, Package, User, Users } from 'lucide-react'

type TaskTastingInformationProps = {
  tasting: Tasting
}

export async function TaskTastingInformation({
  tasting,
}: TaskTastingInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Informações da Degustação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              Promotora
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">
                  {getUserInitials(tasting.promoter.name)}
                </span>
              </div>
              <div>
                <p className="font-medium">{tasting.promoter.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPhoneNumber(tasting.promoter.phone)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              Empresa
            </div>
            <p className="font-medium">{tasting.company.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              Localização
            </div>
            <p className="font-medium">
              {tasting.promoter.city}, {tasting.promoter.state}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              Período
            </div>
            <p className="font-medium">
              {dayjsApi(convertFirebaseDate(tasting.startDate)).format(
                'DD/MM/YYYY',
              )}{' '}
              -{' '}
              {dayjsApi(convertFirebaseDate(tasting.endDate)).format(
                'DD/MM/YYYY',
              )}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4" />
            Produtos ({tasting.products.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {tasting.products.map((product) => (
              <Badge key={product.id} variant="secondary" className="text-xs">
                {product.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
