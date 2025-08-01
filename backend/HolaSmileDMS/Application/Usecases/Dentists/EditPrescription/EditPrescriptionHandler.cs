﻿using System.Security.Claims;
using Application.Constants;
using Application.Interfaces;
using Application.Usecases.SendNotification;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Usecases.Dentists.EditPrescription
{
    public class EditPrescriptionHandler : IRequestHandler<EditPrescriptionCommand, bool>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IMediator _mediator;
        public EditPrescriptionHandler(IHttpContextAccessor httpContextAccessor, IPrescriptionRepository prescriptionRepository, IPatientRepository patientRepository, IMediator mediator)
        {
            _httpContextAccessor = httpContextAccessor;
            _prescriptionRepository = prescriptionRepository;
            _patientRepository = patientRepository;
            _mediator = mediator;
        }
        public async Task<bool> Handle(EditPrescriptionCommand request, CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var currentUserId = int.Parse(user?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var currentUserRole = user?.FindFirst(ClaimTypes.Role)?.Value;
            //Check if the user is authenticated
            if (currentUserId == 0 || string.IsNullOrEmpty(currentUserRole))
            {
                throw new UnauthorizedAccessException(MessageConstants.MSG.MSG53); // "Bạn cần đăng nhập để thực hiện chức năng này"
            }

            //Check if the user is not a dentist return failed message
            if (!string.Equals(currentUserRole, "dentist", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(MessageConstants.MSG.MSG26);
            }

            var existPrescription = await _prescriptionRepository.GetPrescriptionByPrescriptionIdAsync(request.PrescriptionId) ?? throw new Exception(MessageConstants.MSG.MSG16);

            if (string.IsNullOrEmpty(request.contents.Trim())) throw new Exception(MessageConstants.MSG.MSG07);

            existPrescription.Content = request.contents;
            existPrescription.UpdatedAt = DateTime.Now;
            existPrescription.UpdatedBy = currentUserId;
            var isUpdated = await _prescriptionRepository.UpdatePrescriptionAsync(existPrescription);

            try
            {
                var patient = await _patientRepository.GetPatientByPatientIdAsync(existPrescription.Appointment.PatientId);

                await _mediator.Send(new SendNotificationCommand(
                      patient.User.UserID,
                      "Thay đổi thông tin  đơn thuốc",
                      $"Bác sĩ đã thay đổi thông tin đơn thuốc {existPrescription.PrescriptionId} vào lúc {DateTime.Now}",
                      "schedule",
                      0, $"patient/appointments/{existPrescription.AppointmentId}"), cancellationToken);
            }
            catch { }

            return isUpdated;
        }
    }
}
