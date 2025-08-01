import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, FileText, Tag, UserCheck, CheckCircle, XCircle, AlertTriangle, Plus, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import { PrescriptionModal } from './PrescriptionModal';
import { useAuth } from '../../hooks/useAuth';
import { usePrescriptionByAppointment } from '../../hooks/usePrescription';
import { useAppointmentDetail, useChangeAppointmentStatus } from '../../hooks/useAppointments';
import { useDentistSchedule } from '../../hooks/useDentistSchedule';
import { isAppointmentCancellable, getTimeUntilAppointment } from '../../utils/appointmentUtils';
import { Link } from 'react-router';
import { EditAppointmentDialog } from './EditAppointmentDialog';
import { formatDateVN, formatTimeVN } from '../../utils/dateUtils';
import TreatmentModal from '../patient/TreatmentModal';
import { useForm } from 'react-hook-form';
import type { TreatmentFormData } from '@/types/treatment';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useQueryClient } from '@tanstack/react-query';
import { getPatientInstructions } from '@/services/instructionService';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/utils/formatUtils';

interface AppointmentDetailModalProps {
  appointmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDataChange?: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointmentId,
  isOpen,
  onClose,
  onDataChange
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [hasInstruction, setHasInstruction] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    status: 'attended' | 'absented' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: null,
    title: '',
    message: ''
  });

  const { role, userId } = useAuth();
  const userInfo = useUserInfo();
  const queryClient = useQueryClient();

  const treatmentFormMethods = useForm<TreatmentFormData>({});
  const [treatmentToday, setTreatmentToday] = useState<boolean | null>(null);

  // Fetch appointment details
  const { data: appointment, isLoading: isAppointmentLoading } = useAppointmentDetail(appointmentId || 0);

  // Fetch dentist data for edit dialog
  const { dentists } = useDentistSchedule();
  const patientId = appointment?.patientId;

  // Check if prescription exists for this appointment
  const { isLoading: isPrescriptionLoading } = usePrescriptionByAppointment(appointmentId || 0);

  // Change appointment status mutation
  const { mutate: changeStatus, isPending: isChangingStatus } = useChangeAppointmentStatus();

  // Helper function to refresh appointment data
  const refreshAppointmentData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['appointment-detail', appointmentId]
      }),
      queryClient.invalidateQueries({
        queryKey: ['prescription-by-appointment', appointmentId]
      }),
      queryClient.invalidateQueries({
        queryKey: ['appointments']
      })
    ]);
    onDataChange?.();
  };

  useEffect(() => {
    const checkInstructions = async () => {
      if (!appointmentId) return;
      try {
        const list = await getPatientInstructions(appointmentId);
        if (list.length > 0) setHasInstruction(true);
      } catch (err) {
        console.error("Lỗi khi kiểm tra chỉ dẫn:", err);
      }
    };

    if (role === 'Patient' && appointmentId) {
      checkInstructions();
    }
  }, [appointmentId, role]);

  const handleStatusChangeRequest = (newStatus: 'attended' | 'absented') => {
    const statusText = newStatus === 'attended' ? 'đã đến' : 'vắng mặt';
    const title = `Xác nhận ${statusText}`;
    const message = `Bạn có chắc chắn muốn đánh dấu bệnh nhân ${appointment?.patientName} là "${statusText}"?`;
    
    setConfirmModal({
      isOpen: true,
      status: newStatus,
      title,
      message
    });
  };

  const handleConfirmStatusChange = () => {
    if (!confirmModal.status || !appointmentId) return;
    
    changeStatus(
      { appointmentId, status: confirmModal.status },
      {
        onSuccess: () => {
          toast.success(`Đã cập nhật trạng thái thành công`);
          refreshAppointmentData();
          setConfirmModal({ isOpen: false, status: null, title: '', message: '' });
        },
        onError: (error) => {
          toast.error(getErrorMessage(error) || 'Có lỗi xảy ra khi cập nhật trạng thái');
          setConfirmModal({ isOpen: false, status: null, title: '', message: '' });
        }
      }
    );
  };

  if (!isOpen || !appointmentId) return null;

  if (isAppointmentLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/20 bg-opacity-75" onClick={onClose} />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-center text-gray-600">Đang tải thông tin lịch hẹn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/20 bg-opacity-75" onClick={onClose} />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <p className="text-center text-red-600">Không tìm thấy thông tin lịch hẹn</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canCancelAppointment = role === 'Patient' &&
    appointment.status === 'confirmed' &&
    isAppointmentCancellable(appointment.appointmentDate, appointment.appointmentTime);

  const timeUntilAppointment = getTimeUntilAppointment(appointment.appointmentDate, appointment.appointmentTime);

  const getStatusConfig = (
    status: 'confirmed' | 'canceled' | 'attended' | 'absented'
  ) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Đã xác nhận'
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Đã hủy'
        };
      case 'attended':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          text: 'Đã đến'
        };
      case 'absented':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Vắng'
        };
      default:
        return { icon: null, text: status };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);

  const handleTreatmentSubmit = () => {
    setShowTreatmentModal(false);
    refreshAppointmentData();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Chi tiết lịch hẹn
            </h2>

            {/* Action Buttons - Similar to DetailView */}
            <div className="flex items-center gap-2 sm:gap-3">
              {role === 'Dentist' && appointment.status !== "canceled" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTreatmentModal(true);
                    setTreatmentToday(false);
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Tạo hồ sơ điều trị</span>
                  <span className="sm:hidden">Hồ sơ</span>
                </Button>
              )}

              {/* Prescription Button - for both Dentist and Patient */}
              {((role === 'Dentist') || (role !== 'Dentist' && appointment.isExistPrescription)) && (
                <Button
                  variant={appointment.isExistPrescription ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  disabled={isPrescriptionLoading}
                >
                  {isPrescriptionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-gray-600"></div>
                      <span className="hidden sm:inline">Đang tải...</span>
                    </>
                  ) : appointment.isExistPrescription ? (
                    <>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Xem đơn thuốc</span>
                      <span className="sm:hidden">Đơn thuốc</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Thêm đơn thuốc</span>
                      <span className="sm:hidden">Thêm</span>
                    </>
                  )}
                </Button>
              )}

              {/* Instructions Button */}
              {(role === 'Patient' ? hasInstruction : true) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Create InstructionModal instead of navigate
                    // For now, keep navigate behavior but we should create nested modal
                    if (role === 'Patient') {
                      window.open(`/patient/instructions/${appointmentId}`, '_blank');
                    } else {
                      window.open(`/instructions/${appointmentId}`, '_blank');
                    }
                    // Don't close modal - keep it open
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Xem chỉ dẫn</span>
                  <span className="sm:hidden">Chỉ dẫn</span>
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
              <Badge
                variant={
                  appointment.status === 'confirmed'
                    ? 'success'
                    : appointment.status === 'canceled'
                      ? 'destructive'
                      : appointment.status === 'attended'
                        ? 'info'
                        : 'secondary'
                }
                className="flex items-center space-x-2"
              >
                {statusConfig.icon}
                <span>{statusConfig.text}</span>
              </Badge>
            </div>

            {/* Patient & Dentist Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Bệnh nhân</p>
                  <Link to={`/patient/${patientId}`} className="font-semibold text-gray-900">{appointment.patientName}</Link>
                  {appointment.isNewPatient && (
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-600 font-medium">Bệnh nhân mới</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Bác sĩ phụ trách</p>
                  <p className="font-semibold text-gray-900">{appointment.dentistName}</p>
                </div>
              </div>
            </div>
            {/* Date & Time with Cancellation Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Ngày hẹn</p>
                  <p className="font-semibold text-gray-900">{formatDateVN(appointment.appointmentDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Giờ hẹn</p>
                  <p className="font-semibold text-gray-900">{formatTimeVN(appointment.appointmentTime)}</p>
                  {role === 'Patient' && appointment.status === 'confirmed' && (
                    <p className={`text-xs mt-1 ${canCancelAppointment ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {timeUntilAppointment}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Type */}
            <div className="flex items-start">
              <Tag className="h-5 w-5 text-indigo-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Loại hẹn</p>
                <p className="font-semibold text-gray-900">
                  {appointment.appointmentType === 'follow-up'
                    ? 'Tái khám'
                    : appointment.appointmentType === 'consultation'
                      ? 'Tư vấn'
                      : appointment.appointmentType === 'treatment'
                        ? 'Điều trị'
                        : appointment.appointmentType === 'first-time'
                          ? 'Khám lần đầu '
                          : appointment.appointmentType}
                </p>
              </div>
            </div>

            {/* Content */}
            {appointment.content && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Nội dung khám</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{appointment.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="text-gray-900">{formatDateVN(appointment.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cập nhật lần cuối:</span>
                <span className="text-gray-900">{formatDateVN(appointment.updatedAt || appointment.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Warning for non-cancellable appointments */}
          {role === 'Patient' && appointment.status === 'confirmed' && !canCancelAppointment && (
            <div className="flex-1 my-3 mx-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg ">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Không thể hủy lịch hẹn (dưới 2 giờ hoặc đã qua thời gian hẹn)
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            {canCancelAppointment && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className='text-white'
              >
                Hủy lịch hẹn
              </Button>
            )}

            {role === 'Receptionist' && appointment.status === 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChangeRequest('attended')}
                  disabled={isChangingStatus}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isChangingStatus ? 'Đang cập nhật...' : 'Đánh dấu đã đến'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChangeRequest('absented')}
                  disabled={isChangingStatus}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                  {isChangingStatus ? 'Đang cập nhật...' : 'Đánh dấu vắng mặt'}
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowEditDialog(true)}
                >
                  Cập nhật lịch hẹn
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Dialog */}
      {showCancelDialog && (
        <CancelAppointmentDialog
          appointment={appointment}
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onSuccess={() => {
            onClose();
          }}
        />
      )}

      {/* Edit Appointment Dialog */}
      {showEditDialog && (
        <EditAppointmentDialog
          appointment={appointment}
          isOpen={showEditDialog}
          dentists={dentists}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false);
            onClose();
          }}
        />
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <PrescriptionModal
          appointmentId={appointmentId}
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            setShowPrescriptionModal(false);
            refreshAppointmentData();
          }}
        />
      )}

      {/* Treatment Modal */}
      {showTreatmentModal && (
        <TreatmentModal
          formMethods={treatmentFormMethods}
          isOpen={showTreatmentModal}
          isEditing={false}
          treatmentToday={treatmentToday ?? undefined}
          onClose={() => setShowTreatmentModal(false)}
          updatedBy={Number(userInfo.id)}
          appointmentId={appointmentId}
          defaultStatus="in-progress"
          onSubmit={handleTreatmentSubmit}
          patientId={Number(appointment?.patientId)}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, status: null, title: '', message: '' })}
        onConfirm={handleConfirmStatusChange}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.status === 'attended' ? 'Xác nhận đã đến' : 'Xác nhận vắng mặt'}
        confirmVariant={confirmModal.status === 'attended' ? 'default' : 'destructive'}
        isLoading={isChangingStatus}
      />
    </div>
  );
};
