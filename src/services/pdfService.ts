import { tokenStorage } from '@/storage/tokenStorage';
import { Linking, Alert } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://logistic-backend-beta.vercel.app/api/v1';

export const pdfService = {
  openInvoicePdf: async (invoiceId: string) => {
    try {
      const token = tokenStorage.getAccessToken();
      const pdfUrl = `${BASE_URL}/invoices/${invoiceId}/pdf${token ? `?token=${token}` : ''}`;
      await Linking.openURL(pdfUrl);
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'পিডিএফ ফাইল ওপেন করা সম্ভব হয়নি');
    }
  },

  openPaymentReceiptPdf: async (paymentId: string) => {
    try {
      const token = tokenStorage.getAccessToken();
      const pdfUrl = `${BASE_URL}/payments/${paymentId}/pdf${token ? `?token=${token}` : ''}`;
      await Linking.openURL(pdfUrl);
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'পিডিএফ ফাইল ওপেন করা সম্ভব হয়নি');
    }
  },
};
