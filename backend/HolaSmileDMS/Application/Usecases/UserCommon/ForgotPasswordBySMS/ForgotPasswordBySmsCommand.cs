﻿using MediatR;

namespace Application.Usecases.UserCommon.ForgotPasswordBySMS
{
    public class ForgotPasswordBySmsCommand : IRequest<bool>
    {
        public string PhoneNumber { get; set; } = null!;
        public ForgotPasswordBySmsCommand(string phoneNumber)
        {
            PhoneNumber = phoneNumber;
        }
    }
}
