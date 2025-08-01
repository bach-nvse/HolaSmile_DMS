﻿using System.Net.Mail;
using System.Net;
using HDMS_API.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace HDMS_API.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string message, string subject)
        {
            try
            {
                var smtpServer = _config["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"]);
                var senderEmail = _config["EmailSettings:SenderEmail"];
                var senderPassword = _config["EmailSettings:SenderPassword"];

                using (var client = new SmtpClient(smtpServer, smtpPort))
                {
                    client.Credentials = new NetworkCredential(senderEmail, senderPassword);
                    client.EnableSsl = true;

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail),
                        Subject = subject,
                        Body = message,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(toEmail);
                    await client.SendMailAsync(mailMessage);

                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendPasswordAsync(string toEmail, string password)
        {
            try
            {
                var smtpServer = _config["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"]);
                var senderEmail = _config["EmailSettings:SenderEmail"];
                var senderPassword = _config["EmailSettings:SenderPassword"];

                using (var client = new SmtpClient(smtpServer, smtpPort))
                {
                    client.Credentials = new NetworkCredential(senderEmail, senderPassword);
                    client.EnableSsl = true;

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail),
                        Subject = "Mật khẩu tài khoản của bạn",
                        Body = $@"
                                  <p>Phòng khám <strong>HolaSmile</strong> gửi bạn thông tin tài khoản.</p>
                                  <p><strong>Tài khoản:</strong> số điện thoại bạn đã đăng ký tại phòng khám.</p>
                                  <p><strong>Mật khẩu tạm thời của bạn:</strong> <b>{password}</b></p>
                                  <p style='color:red;'><i>Lưu ý:</i> Bạn nên thay đổi mật khẩu sau khi đăng nhập để đảm bảo an toàn bảo mật.</p>
                                  <p>Truy cập vào website để đổi mật khẩu và quản lý hồ sơ: <a href='https://holasmile.vn'>https://holasmile.vn</a></p>
                                 ",
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(toEmail);
                    await client.SendMailAsync(mailMessage);

                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                return false;
            }
        }
    }
}
