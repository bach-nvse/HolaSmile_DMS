import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Search } from "lucide-react"

interface Props {
  searchTerm: string
  onSearchChange: (value: string) => void
  genderFilter: string
  onGenderChange: (value: string) => void
}

export default function PatientFilters({ searchTerm, onSearchChange, genderFilter, onGenderChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 px-4 pb-4">
      <div className="flex-1 relative w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 rounded-md shadow-sm"
        />
      </div>

      <Select value={genderFilter} onValueChange={onGenderChange}>
        <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-md shadow-sm">
          <SelectValue placeholder="Lọc theo giới tính" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất Cả Giới Tính</SelectItem>
          <SelectItem value="Male">Nam</SelectItem>
          <SelectItem value="Female">Nữ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
