import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFinancialTransactions, 
  getFinancialTransactionDetail,
  createFinancialTransaction,
  updateFinancialTransaction,
  deactivateFinancialTransaction,
  exportFinancialTransactions
} from '@/services/financialTransactionApi';

// Query keys
export const FINANCIAL_TRANSACTION_KEYS = {
  all: ['financialTransactions'] as const,
  lists: () => [...FINANCIAL_TRANSACTION_KEYS.all, 'list'] as const,
  list: (filters: string) => [...FINANCIAL_TRANSACTION_KEYS.lists(), { filters }] as const,
  details: () => [...FINANCIAL_TRANSACTION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...FINANCIAL_TRANSACTION_KEYS.details(), id] as const,
};

// Get all financial transactions
export const useFinancialTransactions = () => {
  return useQuery({
    queryKey: FINANCIAL_TRANSACTION_KEYS.lists(),
    queryFn: getFinancialTransactions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get financial transaction detail
export const useFinancialTransactionDetail = (transactionId: number) => {
  return useQuery({
    queryKey: FINANCIAL_TRANSACTION_KEYS.detail(transactionId),
    queryFn: () => getFinancialTransactionDetail(transactionId),
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create financial transaction
export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCIAL_TRANSACTION_KEYS.lists() });
    },
  });
};

// Update financial transaction
export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFinancialTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FINANCIAL_TRANSACTION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FINANCIAL_TRANSACTION_KEYS.detail(variables.transactionID) });
    },
  });
};

// Deactivate financial transaction
export const useDeactivateFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCIAL_TRANSACTION_KEYS.lists() });
    },
  });
};

// Export financial transactions
export const useExportFinancialTransactions = () => {
  return useMutation({
    mutationFn: exportFinancialTransactions,
    onSuccess: (blob) => {
      try {
        // Kiểm tra nếu blob có dữ liệu
        if (!blob || blob.size === 0) {
          throw new Error('File xuất không có dữ liệu');
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Tạo tên file với timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `danh sách thu chi_${timestamp}.xlsx`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export error:', error);
        throw new Error('Có lỗi xảy ra khi tải file xuống');
      }
    },
    onError: (error) => {
      console.error('Export transaction error:', error);
    }
  });
};