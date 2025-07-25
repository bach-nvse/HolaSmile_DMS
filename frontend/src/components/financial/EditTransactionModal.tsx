import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateFinancialTransaction, useFinancialTransactionDetail } from '@/hooks/useFinancialTransactions';
import { formatCurrency, handleCurrencyInput } from '@/utils/currencyUtils';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/utils/formatUtils';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number;
}

interface FormData {
  transactionType: 'thu' | 'chi';
  description: string;
  category: string;
  amount: string;
  paymentMethod: 'cash' | 'transfer';
  transactionDate: string;
  transactionTime: string;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transactionId
}) => {
  const { data: transaction, isLoading, error } = useFinancialTransactionDetail(transactionId);
  const updateTransactionMutation = useUpdateFinancialTransaction();
  const form = useForm<FormData>({
    defaultValues: {
      transactionType: 'thu',
      description: '',
      category: '',
      amount: '',
      paymentMethod: 'cash',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionTime: new Date().toTimeString().split(' ')[0].substring(0, 5)
    }
  });

  // Populate form when transaction data is loaded
  useEffect(() => {
    if (transaction) {
      // Parse date and time from backend response (keep local timezone)
      const transactionDateTime = new Date(transaction.transactionDate);
      const transactionDate = transactionDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
      const transactionTime = transactionDateTime.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      
      const transactionType = transaction.transactionType === 'Thu' ? 'thu' : 'chi';
      const paymentMethod = transaction.paymentMethod === 'Tiền mặt' ? 'cash' : 'transfer';
      
      console.log('Original date from backend:', transaction.transactionDate);
      console.log('Parsed date:', transactionDate);
      console.log('Parsed time:', transactionTime);
      
      const formData = {
        transactionType: transactionType as 'thu' | 'chi',
        description: transaction.description,
        category: transaction.category,
        amount: formatCurrency(transaction.amount),
        paymentMethod: paymentMethod as 'cash' | 'transfer',
        transactionDate: transactionDate,
        transactionTime: transactionTime
      };
      
      setTimeout(() => {
        form.reset(formData);
        form.setValue('transactionType', transactionType, { shouldDirty: true });
        form.setValue('paymentMethod', paymentMethod, { shouldDirty: true });
      }, 100);
    }
  }, [transaction, form]);

  const handleAmountChange = (value: string) => {
    handleCurrencyInput(value, (formattedValue) => {
      form.setValue('amount', formattedValue);
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Convert amount to number (remove formatting)
      const numericAmount = parseInt(data.amount.replace(/[^\d]/g, '')) || 0;
      
      if (numericAmount <= 0) {
        toast.error('Vui lòng nhập số tiền hợp lệ');
        return;
      }

      const requestData = {
        transactionID: transactionId, 
        transactionType: data.transactionType === 'thu', 
        description: data.description,
        category: data.category,
        paymentMethod: data.paymentMethod === 'cash', 
        amount: numericAmount,
        transactionDate: data.transactionDate + 'T' + data.transactionTime + ':00', // Local time without timezone conversion
        createBy: transaction?.createBy || '',
        updateBy: '', 
        createAt: transaction?.createAt || new Date().toISOString(),
        updateAt: null
      };

      await updateTransactionMutation.mutateAsync(requestData);
      
      toast.success(`Đã cập nhật giao dịch ${data.transactionType} thành công`);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error) || `Có lỗi xảy ra khi cập nhật giao dịch`);
    }
  };

  if (!isOpen) return null;

  const transactionType = form.watch('transactionType');
  const isReceipt = transactionType === 'thu';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20 bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <Edit className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Chỉnh Sửa Giao Dịch</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-2">Không thể tải dữ liệu giao dịch</p>
              <p className="text-sm text-gray-600 mb-4">{error.message || 'Có lỗi xảy ra'}</p>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : !transaction ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-2">Không tìm thấy giao dịch</p>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Transaction Type & Category - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label htmlFor="transactionType">Loại giao dịch *</Label>
                <Select 
                  value={form.watch('transactionType') || ''}
                  onValueChange={(value: 'thu' | 'chi') => form.setValue('transactionType', value)}
                  key={`transactionType-${transaction?.transactionID}-${form.watch('transactionType')}`} // Force re-render
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giao dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thu">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>Thu</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="chi">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span>Chi</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Input
                  id="category"
                  placeholder="Nhập danh mục..."
                  {...form.register('category', { required: 'Vui lòng nhập danh mục' })}
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Description - Full Width (2 columns) */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả cho giao dịch..."
                {...form.register('description', { required: 'Vui lòng nhập mô tả' })}
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền *</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    placeholder="0"
                    value={form.watch('amount')}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₫</span>
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Phương thức thanh toán *</Label>
                <Select 
                  value={form.watch('paymentMethod') || ''}
                  onValueChange={(value: 'cash' | 'transfer') => form.setValue('paymentMethod', value)}
                  key={`paymentMethod-${transaction?.transactionID}-${form.watch('paymentMethod')}`} // Force re-render
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="transfer">Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Date */}
              <div className="space-y-2">
                <Label htmlFor="transactionDate">Ngày giao dịch *</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  {...form.register('transactionDate', { required: 'Vui lòng chọn ngày giao dịch' })}
                />
                {form.formState.errors.transactionDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.transactionDate.message}</p>
                )}
              </div>

              {/* Transaction Time */}
              <div className="space-y-2">
                <Label htmlFor="transactionTime">Giờ giao dịch *</Label>
                <Input
                  id="transactionTime"
                  type="time"
                  {...form.register('transactionTime', { required: 'Vui lòng chọn giờ giao dịch' })}
                />
                {form.formState.errors.transactionTime && (
                  <p className="text-sm text-red-600">{form.formState.errors.transactionTime.message}</p>
                )}
              </div>
            </div>

            {/* Preview */}
            {form.watch('amount') && (
              <div className={`rounded-lg p-4 ${isReceipt ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-sm text-gray-600 mb-2">Xem trước thay đổi:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Loại:</span>
                    <span className={`font-medium ${isReceipt ? 'text-green-600' : 'text-red-600'}`}>
                      {isReceipt ? 'Thu' : 'Chi'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tiền:</span>
                    <span className="font-medium">
                      {formatCurrency(parseInt(form.watch('amount').replace(/[^\d]/g, '')) || 0)} ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phương thức:</span>
                    <span className="font-medium">
                      {form.watch('paymentMethod') === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={updateTransactionMutation.isPending}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {updateTransactionMutation.isPending ? 'Đang cập nhật...' : 'Cập Nhật Giao Dịch'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};