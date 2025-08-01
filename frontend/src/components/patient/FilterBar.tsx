import { Filter, Search } from "lucide-react"
import type { UseFormRegister } from "react-hook-form"
import type { FilterFormData } from "@/types/treatment"

interface FilterBarProps {
  register: UseFormRegister<FilterFormData>
}

const FilterBar: React.FC<FilterBarProps> = ({ register }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          {...register("searchTerm")}
          type="text"
          placeholder="Tìm theo mã hồ sơ, vị trí răng, chẩn đoán hoặc triệu chứng..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          {...register("filterStatus")}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="in-progress">Đang điều trị</option>
          <option value="pending">Đã lên lịch</option>
          <option value="canceled">Đã huỷ</option>
        </select>
      </div>
    </div>
  )
}

export default FilterBar
