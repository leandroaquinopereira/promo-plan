import { CardStatisticSection } from './components/card-statistic-section'
import { FilterSection } from './components/filter-section'
import { HeaderSection } from './components/header-section'
import { ListContent } from './components/list-content'

export default async function TastingsPage() {
  return (
    <div className="flex flex-col gap-4 mt-4 @container">
      {/* Header Section */}
      <HeaderSection />

      {/* Stats Cards */}
      {/* <CardStatisticSection /> */}

      {/* Filters and Search */}
      <FilterSection />

      {/* Tastings Table */}
      <ListContent />
    </div>
  )
}
