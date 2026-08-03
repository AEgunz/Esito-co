import axios from 'axios';
import FormData from 'form-data';

class AmeexService {
  private apiId: string;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // These should be in your .env file
    this.apiId = process.env.AMEEX_API_ID || '27124';
    this.apiKey = process.env.AMEEX_API_KEY || 'eC9Dd5-67a379-8Cc8e1-6259dC-34dC45-bF4881';
    this.baseUrl = 'https://api.ameex.app/customer/Delivery/Parcels/Action/Type/Add';
  }

  async createParcel(order: any) {
    if (!this.apiKey || !this.apiId) {
        console.error('AMEEX Configuration Error: API ID or Key missing');
        return null;
    }

    try {
      console.log(`--- STARTING AMEEX SYNC FOR ORDER #${order.id.slice(0,8)} ---`);

      const form = new FormData();

      // Updated to your account Business ID
      form.append('type', 'SIMPLE');
      form.append('business', this.apiId);
      form.append('order_num', order.id.slice(0, 8));
      form.append('replace', 'true');
      form.append('exchange_code', '');
      form.append('open', 'YES');
      form.append('try', 'YES');
      form.append('fragile', '0');
      form.append('receiver', order.firstName);
      form.append('phone', order.phone.replace(/\s/g, ''));
      form.append('city', String(order.city)); // Must be the ID (e.g. "1")
      form.append('address', order.address);
      form.append('comment', `Custom Text: ${order.items.map((i: any) => i.customText).filter(Boolean).join(', ') || 'None'}`);
      form.append('product', order.items.map((i: any) => i.product?.name).join(', ') || 'Custom MDF');
      form.append('cod', Math.round(Number(order.totalAmount)).toString());

      // Headers from the provided CURL
      const headers = {
        ...form.getHeaders(),
        'C-Api-Id': this.apiId,
        'C-Api-Key': this.apiKey
      };

      const response = await axios.post(this.baseUrl, form, { headers });

      if (response.data && (response.data.status === true || response.data.success)) {
        console.log('✅ AMEEX SUCCESS:', response.data.message || 'Parcel Created');
        // Return tracking code if available, otherwise return a success flag
        return response.data.tracking_code || response.data.id || "SUCCESS";
      } else {
        console.warn('⚠️ AMEEX API returned unexpected format or error:', response.data);
        return response.data.tracking_code || null;
      }

    } catch (error: any) {
      console.error('❌ AMEEX API ERROR:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Message:', error.message);
      }
      return null;
    }
  }

  mapStatus(ameexStatus: string): string {
    const statusMap: Record<string, string> = {
        'nouveau': 'PENDING',
        'pret': 'PROCESSING',
        'expedie': 'SHIPPED',
        'livre': 'DELIVERED',
        'annule': 'CANCELLED'
    };
    return statusMap[ameexStatus.toLowerCase()] || 'PENDING';
  }
}

export default new AmeexService();
