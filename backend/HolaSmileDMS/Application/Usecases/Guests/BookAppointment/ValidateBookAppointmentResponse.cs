﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Usecases.Guests.BookAppointment
{
    public class ValidateBookAppointmentResponse
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string MedicalIssue { get; set; }
    }
}
