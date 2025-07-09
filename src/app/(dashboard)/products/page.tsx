import { FilterSection } from './components/filter-section'
import { HeaderSection } from './components/header-section'
import { ListContent } from './components/list-content'

export default async function ProductsPage() {
  return (
    <div className="flex flex-col gap-4 mt-4 @container">
      <HeaderSection />
      <FilterSection />
      <ListContent />
    </div>
  )
}
