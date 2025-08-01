﻿using Application.Usecases.UserCommon.ViewProfile;
using HDMS_API.Application.Usecases.Receptionist.CreatePatientAccount;
using HDMS_API.Application.Usecases.UserCommon.Login;
using Application.Usecases.Administrator.ViewListUser;

namespace Application.Interfaces
{
    public interface IUserCommonRepository
    {
        Task<User> CreatePatientAccountAsync(CreatePatientDto dto, string password);
        Task<bool> ResetPasswordAsync(User user);
        Task<User?> GetUserByPhoneAsync(string phone);
        Task<User?> GetUserByEmailAsync(string email);
        public Task<User> GetByUsernameAsync(string username, CancellationToken cancellationToken);
        Task<bool> EditProfileAsync(User user, CancellationToken cancellationToken);
        Task<ViewProfileDto?> GetUserProfileAsync(int userId, CancellationToken cancellationToken);
        Task<UserRoleResult?> GetUserRoleAsync(string username, CancellationToken cancellationToken);
        Task<User?> GetByIdAsync(int? userId, CancellationToken cancellationToken);
        Task<List<Patient>> GetAllPatientsAsync(CancellationToken cancellationToken);
        Task<List<Receptionist>> GetAllReceptionistAsync();
        Task<List<ViewListUserDTO>> GetAllUserAsync();
        Task<bool> CreateUserAsync(User user, string role);
        Task<bool> UpdateUserStatusAsync(int userId, int updatedBy);
        Task<int?> GetUserIdByRoleTableIdAsync(string role, int id);
    }
}
