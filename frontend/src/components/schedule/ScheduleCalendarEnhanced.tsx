// filepath: d:\HolaSmile\HolaSmile_DMS\frontend\src\components\schedule\ScheduleCalendarEnhanced.tsx
import React, { useState } from 'react';
import { addDays, format, startOfWeek, addWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShiftType, ScheduleStatus } from '@/types/schedule';
import type { Schedule } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { isPastDate } from '@/utils/dateUtils';

interface ScheduleCalendarEnhancedProps {
  schedules: Schedule[];
  onDateSelect?: (date: string, shift: ShiftType) => void;
  onSlotSelect?: (date: string, shift: ShiftType) => void;
  selectedDate?: string;
  selectedShift?: string;
  selectedSlots?: Array<{date: string, shift: ShiftType}>;
  currentWeek?: number;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  canAddSchedule?: boolean;
  disablePastDates?: boolean;
  isMultiSelectMode?: boolean;
  showDentistInfo?: boolean;
}

export const ScheduleCalendarEnhanced: React.FC<ScheduleCalendarEnhancedProps> = ({
  schedules = [],
  onDateSelect,
  onSlotSelect,
  selectedDate = '',
  selectedShift = '',
  selectedSlots = [],
  currentWeek = 0,
  onPreviousWeek,
  onNextWeek,
  canAddSchedule = false,
  disablePastDates = true,
  isMultiSelectMode = false,
  showDentistInfo = false
}) => {
  // State để theo dõi tuần hiện tại
  const [weekOffset, setWeekOffset] = useState(currentWeek);
  
  // Lấy ngày đầu tuần
  const getStartOfWeek = (offset = 0) => {
    const now = new Date();
    // Lấy ngày đầu tuần (Thứ Hai)
    const startDay = startOfWeek(now, { weekStartsOn: 1 });
    // Thêm offset tuần
    return addWeeks(startDay, offset);
  };
  
  // Tạo mảng các ngày trong tuần
  const getDaysOfWeek = (startDay: Date) => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
  };
  
  // Ngày đầu tuần hiện tại
  const startDay = getStartOfWeek(weekOffset);
  
  // Các ngày trong tuần
  const daysOfWeek = getDaysOfWeek(startDay);
  
  // Xử lý khi chuyển tuần trước
  const handlePreviousWeek = () => {
    const newOffset = weekOffset - 1;
    setWeekOffset(newOffset);
    if (onPreviousWeek) onPreviousWeek();
  };
  
  // Xử lý khi chuyển tuần sau
  const handleNextWeek = () => {
    const newOffset = weekOffset + 1;
    setWeekOffset(newOffset);
    if (onNextWeek) onNextWeek();
  };
    // Format ngày thành chuỗi YYYY-MM-DD cho việc so sánh
  const formatDateForCompare = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Kiểm tra xem ca làm việc có được đặt trước không
  const isShiftScheduled = (date: Date, shift: ShiftType) => {
    const formattedDate = formatDateForCompare(date);
    return schedules.some(
      (schedule) => 
        schedule.date === formattedDate && 
        schedule.shift === shift
    );
  };
  
  // Lấy trạng thái của ca làm việc
  const getShiftStatus = (date: Date, shift: ShiftType): ScheduleStatus | null => {
    const formattedDate = formatDateForCompare(date);
    const schedule = schedules.find(
      (s) => s.date === formattedDate && s.shift === shift
    );
    return schedule ? schedule.status as ScheduleStatus : null;
  };
  
  // Kiểm tra xem ngày và ca làm việc có được chọn không
  const isSelected = (date: Date, shift: ShiftType) => {
    const formattedDate = formatDateForCompare(date);
    return formattedDate === selectedDate && shift === selectedShift;
  };
  
  // Kiểm tra xem ca này có trong danh sách đã chọn không
  const isInSelectedSlots = (date: Date, shift: ShiftType) => {
    const formattedDate = formatDateForCompare(date);
    return selectedSlots.some(slot => slot.date === formattedDate && slot.shift === shift);
  };
  
  // Lấy thông tin bác sĩ từ lịch
  const getDentistInfo = (date: Date, shift: ShiftType) => {
    const formattedDate = formatDateForCompare(date);
    const schedule = schedules.find(
      (s) => s.date === formattedDate && s.shift === shift
    );
    return schedule ? schedule.dentistName : null;
  };
  
  // Render giao diện ca làm việc
  const renderShift = (date: Date, shift: ShiftType) => {
    const scheduled = isShiftScheduled(date, shift);
    const status = getShiftStatus(date, shift);
    const selected = isSelected(date, shift);
    const isMultiSelected = isInSelectedSlots(date, shift);
    const isPast = disablePastDates && isPastDate(date);
    const dentistName = showDentistInfo ? getDentistInfo(date, shift) : null;
    
    let className = "flex flex-col items-center justify-center h-14 rounded-md text-sm font-medium transition-colors ";

    
    if (scheduled) {
      // Nếu đã có lịch, hiển thị màu khác nhau dựa trên trạng thái
      if (status === ScheduleStatus.Approved) {
        className += "bg-green-100 text-green-800 ";
      } else if (status === ScheduleStatus.Rejected) {
        className += "bg-red-100 text-red-800 ";  
      } else {
        className += "bg-yellow-100 text-yellow-800 ";
      }
    } else if (isPast) {
      // Ngày trong quá khứ
      className += "bg-gray-100 text-gray-400 opacity-50 ";
    } else if (canAddSchedule) {
      // Nếu có thể đặt lịch và chưa có lịch
      className += "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer ";
    } else {
      // Slot trống không thể đặt
      className += "bg-gray-100 text-gray-400 ";
    }
    
    // Nếu được chọn
    if (selected) {
      className += "ring-2 ring-blue-500 ";
    }
    
    // Nếu được chọn trong nhiều ca
    if (isMultiSelected) {
      className += "ring-2 ring-purple-500 bg-purple-50 text-purple-800 ";
    }
    
    // Tên hiển thị của ca
    const shiftNames = {
      [ShiftType.Morning]: "Sáng",
      [ShiftType.Afternoon]: "Chiều",
      [ShiftType.Evening]: "Tối",
    };
    
    // Giờ làm việc của ca
    const shiftTimes = {
      [ShiftType.Morning]: "8:00 - 11:00",
      [ShiftType.Afternoon]: "14:00 - 17:00",
      [ShiftType.Evening]: "17:00 - 20:00",
    };
    
    return (
      <div 
        className={className}
        onClick={() => {
          if (isPast) {
            return; // Không cho phép chọn ngày trong quá khứ
          }
          
          if (isMultiSelectMode && onSlotSelect && (canAddSchedule || scheduled)) {
            onSlotSelect(formatDateForCompare(date), shift);
          } else if ((canAddSchedule && !scheduled) || scheduled) {
            if (onDateSelect) {
              onDateSelect(formatDateForCompare(date), shift);
            }
          }
        }}
      >
        <div className="text-center">
          <div className="font-medium">{shiftNames[shift]}</div>
          <div className="text-xs mt-0.5">{shiftTimes[shift]}</div>
          {showDentistInfo && dentistName && (
            <div className="text-xs mt-1 max-w-[90px] truncate" title={dentistName}>
              {dentistName}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header với điều hướng tuần */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePreviousWeek}
          disabled={disablePastDates && weekOffset <= 0} // Giới hạn về quá khứ nếu disablePastDates
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-base sm:text-lg font-medium text-gray-900 text-center px-2">
          {format(startDay, "d MMM", { locale: vi })} - {format(daysOfWeek[6], "d MMM yyyy", { locale: vi })}
        </h3>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNextWeek}
          disabled={weekOffset >= 8} // Giới hạn về tương lai (2 tháng)
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-1 p-4">
          {/* Header các ngày trong tuần */}
          {daysOfWeek.map((day, i) => (
            <div key={`header-${i}`} className="text-center">
              <div className="font-medium text-sm text-gray-900">
                {format(day, "EEEE", { locale: vi })}
              </div>
              <div className={cn(
                "text-xs mt-1 inline-block px-2 py-1 rounded-full",
                format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ? "bg-blue-100 text-blue-800"
                  : "text-gray-500"
              )}>
                {format(day, "d/MM")}
              </div>
            </div>
          ))}
          
          {/* Ca sáng */}
          {daysOfWeek.map((day, i) => (
            <div key={`morning-${i}`} className="pt-2">
              {renderShift(day, ShiftType.Morning)}
            </div>
          ))}
          
          {/* Ca chiều */}
          {daysOfWeek.map((day, i) => (
            <div key={`afternoon-${i}`} className="pt-2">
              {renderShift(day, ShiftType.Afternoon)}
            </div>
          ))}
          
          {/* Ca tối */}
          {daysOfWeek.map((day, i) => (
            <div key={`evening-${i}`} className="pt-2">
              {renderShift(day, ShiftType.Evening)}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px] p-3">
            <div className="grid grid-cols-7 gap-2">
              {/* Header các ngày trong tuần */}
              {daysOfWeek.map((day, i) => (
                <div key={`header-${i}`} className="text-center min-w-[90px]">
                  <div className="font-medium text-xs text-gray-900">
                    {format(day, "EEE", { locale: vi })}
                  </div>
                  <div className={cn(
                    "text-xs mt-1 inline-block px-2 py-1 rounded-full",
                    format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-500"
                  )}>
                    {format(day, "d/MM")}
                  </div>
                </div>
              ))}
              
              {/* Ca sáng */}
              {daysOfWeek.map((day, i) => (
                <div key={`morning-${i}`} className="pt-2 min-w-[90px]">
                  {renderShift(day, ShiftType.Morning)}
                </div>
              ))}
              
              {/* Ca chiều */}
              {daysOfWeek.map((day, i) => (
                <div key={`afternoon-${i}`} className="pt-2 min-w-[90px]">
                  {renderShift(day, ShiftType.Afternoon)}
                </div>
              ))}
              
              {/* Ca tối */}
              {daysOfWeek.map((day, i) => (
                <div key={`evening-${i}`} className="pt-2 min-w-[90px]">
                  {renderShift(day, ShiftType.Evening)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chú thích */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-600">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-100 rounded-full mr-1"></span>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            <span>Đã duyệt</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-yellow-100 rounded-full mr-1"></span>
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
            <span>Chờ duyệt</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-100 rounded-full mr-1"></span>
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
            <span>Từ chối</span>
          </div>
          {canAddSchedule && (
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-gray-100 rounded-full mr-1"></span>
              <span>Có thể đăng ký</span>
            </div>
          )}
          {isMultiSelectMode && (
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-purple-50 rounded-full mr-1 ring-1 ring-purple-500"></span>
              <span>Đã chọn</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};