'use client'

import type { Tasting } from '@promo/@types/firebase'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Card, CardContent } from '@promo/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@promo/components/ui/table'
import { LoaderPinwheel, Wine } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

// Mock data para demonstração
const mockTastings: Tasting[] = [
  {
    id: '1',
    processId: 2024001,
    promoterId: 'promoter-1',
    promoter: {
      id: 'promoter-1',
      name: 'Maria Silva',
      phone: '11987654321',
      email: 'maria@example.com',
      password: '',
      role: {} as any,
      active: true,
      state: 'SP',
      city: 'São Paulo',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: '',
      updatedBy: '',
      lastLoggedAt: new Date() as any,
      situation: 'active',
      status: 'online',
    },
    startDate: new Date('2024-01-15') as any,
    endDate: new Date('2024-01-20') as any,
    company: 'Supermercado ABC',
    city: 'São Paulo',
    state: 'SP',
    products: ['Refrigerante Cola', 'Suco de Laranja', 'Água Mineral'],
    notes: 'Degustação na seção de bebidas',
    status: 'active',
    createdAt: new Date('2024-01-10') as any,
    updatedAt: new Date('2024-01-10') as any,
    createdBy: 'admin',
    updatedBy: 'admin',
    evidences: [],
  },
  {
    id: '2',
    processId: 2024002,
    promoterId: 'promoter-2',
    promoter: {
      id: 'promoter-2',
      name: 'João Santos',
      phone: '11987654322',
      email: 'joao@example.com',
      password: '',
      role: {} as any,
      active: true,
      state: 'RJ',
      city: 'Rio de Janeiro',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: '',
      updatedBy: '',
      lastLoggedAt: new Date() as any,
      situation: 'active',
      status: 'working',
    },
    startDate: new Date('2024-01-22') as any,
    endDate: new Date('2024-01-25') as any,
    company: 'Hipermercado XYZ',
    city: 'Rio de Janeiro',
    state: 'RJ',
    products: ['Biscoito Recheado', 'Chocolate', 'Bala'],
    notes: 'Degustação na seção de doces',
    status: 'completed',
    createdAt: new Date('2024-01-18') as any,
    updatedAt: new Date('2024-01-26') as any,
    createdBy: 'admin',
    updatedBy: 'admin',
    evidences: [
      {
        id: 'evidence-1',
        name: 'Foto da degustação',
        url: 'https://example.com/photo.jpg',
        type: 'image',
        uploadedAt: new Date() as any,
      },
    ],
  },
  {
    id: '3',
    processId: 2024003,
    promoterId: 'promoter-3',
    promoter: {
      id: 'promoter-3',
      name: 'Ana Costa',
      phone: '11987654323',
      email: 'ana@example.com',
      password: '',
      role: {} as any,
      active: true,
      state: 'MG',
      city: 'Belo Horizonte',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: '',
      updatedBy: '',
      lastLoggedAt: new Date() as any,
      situation: 'active',
      status: 'offline',
    },
    startDate: new Date('2024-02-01') as any,
    endDate: new Date('2024-02-05') as any,
    company: 'Mercado Central',
    city: 'Belo Horizonte',
    state: 'MG',
    products: ['Café Premium', 'Açúcar Cristal'],
    notes: 'Degustação no corredor principal',
    status: 'draft',
    createdAt: new Date('2024-01-28') as any,
    updatedAt: new Date('2024-01-28') as any,
    createdBy: 'admin',
    updatedBy: 'admin',
    evidences: [],
  },
  {
    id: '4',
    processId: 2024004,
    promoterId: 'promoter-4',
    promoter: {
      id: 'promoter-4',
      name: 'Carlos Oliveira',
      phone: '11987654324',
      email: 'carlos@example.com',
      password: '',
      role: {} as any,
      active: true,
      state: 'RS',
      city: 'Porto Alegre',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: '',
      updatedBy: '',
      lastLoggedAt: new Date() as any,
      situation: 'active',
      status: 'online',
    },
    startDate: new Date('2024-02-10') as any,
    endDate: new Date('2024-02-12') as any,
    company: 'Loja de Conveniência',
    city: 'Porto Alegre',
    state: 'RS',
    products: ['Energia Drink', 'Isotônico'],
    notes: 'Degustação próxima ao caixa',
    status: 'cancelled',
    createdAt: new Date('2024-02-05') as any,
    updatedAt: new Date('2024-02-08') as any,
    createdBy: 'admin',
    updatedBy: 'admin',
    evidences: [],
  },
  {
    id: '5',
    processId: 2024005,
    promoterId: 'promoter-5',
    promoter: {
      id: 'promoter-5',
      name: 'Fernanda Lima',
      phone: '11987654325',
      email: 'fernanda@example.com',
      password: '',
      role: {} as any,
      active: true,
      state: 'BA',
      city: 'Salvador',
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: '',
      updatedBy: '',
      lastLoggedAt: new Date() as any,
      situation: 'active',
      status: 'working',
    },
    startDate: new Date('2024-02-15') as any,
    endDate: new Date('2024-02-18') as any,
    company: 'Shopping Center',
    city: 'Salvador',
    state: 'BA',
    products: ['Iogurte Natural', 'Queijo Coalho'],
    notes: 'Degustação na praça de alimentação',
    status: 'postponed',
    createdAt: new Date('2024-02-10') as any,
    updatedAt: new Date('2024-02-13') as any,
    createdBy: 'admin',
    updatedBy: 'admin',
    evidences: [],
  },
]

export function ListContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [filteredTastings, setFilteredTastings] =
    useState<Tasting[]>(mockTastings)

  // Query states for filters
  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [processId] = useQueryState('processId', parseAsString.withDefault(''))
  const [company] = useQueryState('company', parseAsString.withDefault(''))
  const [state] = useQueryState('state', parseAsString.withDefault('all'))
  const [city] = useQueryState('city', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsString.withDefault('all'))
  const [currentPage] = useQueryState(
    'current-page',
    parseAsInteger.withDefault(1),
  )

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter tastings based on query parameters
  useEffect(() => {
    let filtered = mockTastings

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (tasting) =>
          tasting.company.toLowerCase().includes(search.toLowerCase()) ||
          (typeof tasting.promoter === 'object' &&
            tasting.promoter.name
              .toLowerCase()
              .includes(search.toLowerCase())) ||
          tasting.city.toLowerCase().includes(search.toLowerCase()) ||
          tasting.products.some((product) =>
            product.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    }

    // Apply process ID filter
    if (processId) {
      filtered = filtered.filter((tasting) =>
        tasting.processId.toString().includes(processId),
      )
    }

    // Apply company filter
    if (company) {
      filtered = filtered.filter((tasting) =>
        tasting.company.toLowerCase().includes(company.toLowerCase()),
      )
    }

    // Apply state filter
    if (state && state !== 'all') {
      filtered = filtered.filter((tasting) => tasting.state === state)
    }

    // Apply city filter
    if (city) {
      filtered = filtered.filter((tasting) =>
        tasting.city.toLowerCase().includes(city.toLowerCase()),
      )
    }

    // Apply status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((tasting) => tasting.status === status)
    }

    setFilteredTastings(filtered)
  }, [search, processId, company, state, city, status])

  function handleSelectedRow(checked: boolean, tastingId: string) {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (checked) {
        newSelected.add(tastingId)
      } else {
        newSelected.delete(tastingId)
      }
      return newSelected
    })
  }

  function handleSelectedAllRows(checked: boolean) {
    if (checked) {
      setSelectedRows(new Set(filteredTastings.map((tasting) => tasting.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const isAllSelected =
    filteredTastings.length > 0 && selectedRows.size === filteredTastings.length

  // Pagination
  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTastings = filteredTastings.slice(startIndex, endIndex)

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardContent className="p-0">
          <Table>
            <ListTableHeader
              isAllSelected={isAllSelected}
              onSelectedAllRows={handleSelectedAllRows}
            />
            <TableBody>
              {!isLoading &&
                paginatedTastings.map((tasting) => (
                  <ListTableRow
                    key={tasting.id}
                    data={tasting}
                    isSelected={selectedRows.has(tasting.id)}
                    onSelectedRow={handleSelectedRow}
                  />
                ))}

              {!isLoading && filteredTastings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground p-20"
                  >
                    <Wine className="mx-auto mb-4 size-12 text-muted-foreground" />
                    Nenhuma degustação encontrada.
                    <br />
                    Tente ajustar os filtros ou adicionar novas degustações.
                  </TableCell>
                </TableRow>
              )}

              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground p-20"
                  >
                    <LoaderPinwheel className="mx-auto mb-4 size-8 text-muted-foreground animate-spin" />
                    Carregando degustações...
                    <br />
                    Aguarde enquanto as degustações são carregadas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <ListPaginationSection
          totalTastings={filteredTastings.length}
          totalTastingsShowing={paginatedTastings.length}
        />
      </Card>
    </MotionDiv>
  )
}
