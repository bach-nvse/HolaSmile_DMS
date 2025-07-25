﻿using MediatR;

namespace Application.Usecases.Receptionist.CreateFinancialTransaction
{
    public class CreateFinancialTransactionCommand : IRequest<bool>
    {
        public bool TransactionType { get; set; } // true for thu, false for chi
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public bool PaymentMethod { get; set; } //true for tien mat, false for chuyen khoan
        public DateTime TransactionDate { get; set; }

    }
}
