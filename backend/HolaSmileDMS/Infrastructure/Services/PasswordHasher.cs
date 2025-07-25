﻿using Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public bool Verify(string inputPassword, string storedHash)
        {
            bool checkPassword = BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
            return checkPassword;
        }
    }
}
