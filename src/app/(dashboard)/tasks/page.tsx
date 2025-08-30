import { HeaderSection } from './components/header-section'
import { ListContent } from './components/list-content'

export default async function TasksPage() {
  return (
    <div className="flex flex-col gap-4 mt-4 @container">
      {/* Header Section */}
      <HeaderSection />

      {/* Tasks Table */}
      <ListContent />
    </div>
  )
}
