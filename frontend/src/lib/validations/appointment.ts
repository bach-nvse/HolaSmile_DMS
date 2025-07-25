import * as z from 'zod';

export const appointmentFormSchema = z.object({
  fullName: z
    .string()
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự'),
  email: z
    .string()
    .email('Email không hợp lệ')
    .min(1, 'Email là bắt buộc'),
  phoneNumber: z
    .string()
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
    .min(10, 'Số điện thoại phải có 10 số')
    .max(10, 'Số điện thoại không được vượt quá 10 số'),
  medicalIssue: z
    .string()
    .min(10, 'Vui lòng mô tả chi tiết vấn đề (ít nhất 10 ký tự)')
    .max(500, 'Mô tả không được vượt quá 500 ký tự'),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;