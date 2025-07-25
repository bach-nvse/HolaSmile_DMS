import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button2"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Phone, Mail, MoreHorizontal } from "lucide-react"
import type { Patient } from "@/types/patient"
import { Link } from "react-router"
import { formatDateWithDay } from "@/utils/dateUtils"
import { useNavigate } from "react-router"
import { useUserInfo } from "@/hooks/useUserInfo"
import PatientDetailModal from "./PatientDetailModal" // Import modal component

interface Props {
    patient: Patient
    index: number
    onEdit: (patient: Patient) => void
    shouldHideTreatmentRecords?: boolean
}

export default function PatientTableRow({ patient, index, onEdit, shouldHideTreatmentRecords = false }: Props) {
    // Sử dụng màu xanh nhạt và tím nhạt thay vì trắng và xám
    const rowBg = index % 2 === 0 ? "bg-blue-50/30" : "bg-purple-50/30"
    const hoverBg = index % 2 === 0 ? "hover:bg-blue-100/50" : "hover:bg-purple-100/50"
    
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleViewDetail = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const isDentistOrAssistant = userInfo?.role === 'Dentist' || userInfo?.role === 'Assistant'; 

    return (
        <>
            <tr
                className={`shadow-sm custom-row-shadow ${rowBg} ${hoverBg} transition-colors duration-200`}
            >
                <td className="p-4 first:rounded-l-md">{patient.fullname}</td>
                <td className="p-4">
                    <Badge
                        className={
                            patient.gender === "Male"
                                ? "bg-blue-500 text-white"
                                : "bg-pink-500 text-white"
                        }
                    >
                        {patient.gender === "Male" ? "Nam" : "Nữ"}
                    </Badge>
                </td>
                <td className="p-4 text-sm">{formatDateWithDay(patient.dob)}</td>
                <td className="p-4">
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                        </div>
                    </div>
                </td>
                {!shouldHideTreatmentRecords && (
                    <td className="p-4">
                        <Button asChild variant="outline" size="sm">
                            <Link to={`/patient/view-treatment-records?patientId=${patient.patientId}`}>
                                Xem Hồ Sơ Điều Trị
                            </Link>
                        </Button>
                    </td>
                )}
                <td className="p-4 last:rounded-r-md">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Tùy chọn">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleViewDetail}>
                                Xem Chi Tiết
                            </DropdownMenuItem>
                            {userInfo?.role === "Receptionist" && (
                                <DropdownMenuItem onClick={() => onEdit(patient)}>
                                    Chỉnh Sửa Bệnh Nhân
                                </DropdownMenuItem>
                            )}
                            {userInfo?.role === "Receptionist" && (
                                <DropdownMenuItem
                                    onClick={() => navigate(`/patient/follow-up?patientId=${patient.patientId}`)}
                                >
                                    Tạo Lịch Tái Khám
                                </DropdownMenuItem>
                            )}
                            {isDentistOrAssistant && (
                                <DropdownMenuItem
                                    onClick={() => navigate(`/patients/${patient.patientId}/orthodontic-treatment-plans`)}
                                >
                                    Kế Hoạch Điều Trị
                                </DropdownMenuItem>
                            )}

                        </DropdownMenuContent>
                    </DropdownMenu>
                </td>
            </tr>

            {/* Patient Detail Modal */}
            <PatientDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                patientId={patient.patientId}
            />
        </>
    )
}