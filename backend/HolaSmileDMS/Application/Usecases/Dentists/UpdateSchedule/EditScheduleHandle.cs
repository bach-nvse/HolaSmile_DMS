﻿using System.Security.Claims;
using Application.Constants;
using Application.Interfaces;
using Application.Usecases.SendNotification;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Usecases.Dentist.UpdateSchedule
{
    public class EditScheduleHandle : IRequestHandler<EditScheduleCommand, bool>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IDentistRepository _dentistRepository;
        private readonly IOwnerRepository _ownerRepository;
        private readonly IMediator _mediator;

        public EditScheduleHandle(IHttpContextAccessor httpContextAccessor, IScheduleRepository scheduleRepository, IDentistRepository dentistRepository, IOwnerRepository ownerRepository, IMediator mediator)
        {
            _httpContextAccessor = httpContextAccessor;
            _dentistRepository = dentistRepository;
            _scheduleRepository = scheduleRepository;
            _ownerRepository = ownerRepository;
            _mediator = mediator;
        }


        public async Task<bool> Handle(EditScheduleCommand request, CancellationToken cancellationToken)
        {
            // Lấy thông tin người dùng hiện tại
            var user = _httpContextAccessor.HttpContext?.User;
            var currentUserRole = user?.FindFirst(ClaimTypes.Role)?.Value;
            var currentUserId = int.Parse(user?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (currentUserRole == null)
            {
                throw new UnauthorizedAccessException(MessageConstants.MSG.MSG53); // "Bạn cần đăng nhập để thực hiện chức năng này"
            }

            // Giải mã ScheduleId và lấy lịch làm việc
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(request.ScheduleId);
            if (schedule == null)
            {
                throw new Exception(MessageConstants.MSG.MSG28);
            }

            // Kiểm tra quyền của người dùng (chỉ Dentist được sửa)
            if (!string.Equals(currentUserRole, "dentist", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(MessageConstants.MSG.MSG26);
            }

            // Lấy thông tin Dentist hiện tại
            var dentist = await _dentistRepository.GetDentistByUserIdAsync(currentUserId);
            if (dentist == null || schedule.DentistId != dentist.DentistId)
            {
                throw new UnauthorizedAccessException(MessageConstants.MSG.MSG26); // "Bạn không có quyền truy cập chức năng này."
            }

            // Nếu lịch chưa được Owner duyệt ,cập nhật lịch thẳng
            if (schedule.Status != "pending")
            {
                throw new Exception("Lịch làm việc đã được duyệt, không thể chỉnh sửa."); // "Schedule has been approved, cannot edit."

            }
            // Kiểm tra trùng lịch với lịch khác (ngoại trừ chính lịch này)
            var isDuplicate = await _scheduleRepository.CheckDulplicateScheduleAsync(
                    dentist.DentistId,
                    request.WorkDate,
                    request.Shift,
                    schedule.ScheduleId
                );

            if (isDuplicate != null)
            {
                if (isDuplicate.Status == "rejected")
                {
                    // xóa mềm lịch bị từ chối cũ
                    await _scheduleRepository.DeleteSchedule(isDuplicate.ScheduleId, currentUserId);
                }
                else
                {
                    throw new Exception(MessageConstants.MSG.MSG89); // lịch trùng và đang pending/approved
                }
            }

            // Cập nhật thông tin lịch làm việc
            schedule.WorkDate = request.WorkDate;
            schedule.Shift = request.Shift;
            schedule.UpdatedAt = DateTime.Now;
            schedule.UpdatedBy = currentUserId;

            var updated = await _scheduleRepository.UpdateScheduleAsync(schedule);

            // Send notification to owner and dentist
            try
            {
                var owners = await _ownerRepository.GetAllOwnersAsync();
                var notifyOwners = owners.Select(async o =>
                await _mediator.Send(new SendNotificationCommand(
                      o.User.UserID,
                      "Đăng ký lịch làm việc",
                      $"Nha Sĩ {o.User.Fullname} đã thay đổi đăng ký lịch làm việc vào lúc {DateTime.Now}",
                      "schedule", 0, $"schedules"),
                cancellationToken));
                await System.Threading.Tasks.Task.WhenAll(notifyOwners);
            }
            catch { }
            return updated;
        }
    }

}
