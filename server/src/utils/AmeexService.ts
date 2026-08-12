import axios from 'axios';
import FormData from 'form-data';

class AmeexService {
  private apiId: string;
  private apiKey: string;
  private baseUrl: string = 'https://api.ameex.app/customer/Delivery/Parcels';

  constructor() {
    this.apiId = process.env.AMEEX_API_ID || '27124';
    this.apiKey = process.env.AMEEX_API_KEY || 'eC9Dd5-67a379-8Cc8e1-6259dC-34dC45-bF4881';
  }

  private getHeaders(formHeaders?: any) {
    return {
      ...formHeaders,
      'C-Api-Id': this.apiId,
      'C-Api-Key': this.apiKey
    };
  }

  async createParcel(order: any) {
    try {
      const form = new FormData();
      form.append('type', 'SIMPLE');
      form.append('business', '2');
      form.append('order_num', order.id.slice(0, 8));
      form.append('replace', 'true');
      form.append('exchange_code', '');
      form.append('open', 'YES');
      form.append('try', 'YES');
      form.append('fragile', '0');
      form.append('receiver', order.firstName);
      form.append('phone', order.phone.replace(/\s/g, ''));
      form.append('city', String(order.city));
      form.append('address', order.address);
      form.append('comment', order.note || '');
      form.append('product', order.items.map((i: any) => i.product?.name).join(', '));
      form.append('cod', Math.round(Number(order.totalAmount)).toString());

      const response = await axios.post(`${this.baseUrl}/Action/Type/Add`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      console.error('Ameex Add Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async editParcel(parcelCode: string, data: any) {
    try {
      const form = new FormData();
      Object.keys(data).forEach(key => form.append(key, String(data[key])));
      const response = await axios.post(`${this.baseUrl}/Action/Type/Edit?ParcelCode=${parcelCode}`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteParcel(parcelCode: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/Action/Type/Delete?ParcelCode=${parcelCode}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getParcelInfo(parcelCode: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Info?ParcelCode=${parcelCode}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getParcelTracking(parcelCode: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Tracking?ParcelCode=${parcelCode}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getParcelStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/Statuts`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async massTracking(codes: string) {
    try {
      const form = new FormData();
      form.append('codes', codes);
      const response = await axios.post(`${this.baseUrl}/MassTracking`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async massInfo(codes: string) {
    try {
      const form = new FormData();
      form.append('codes', codes);
      const response = await axios.post(`${this.baseUrl}/MassInfo`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async relaunchParcel(parcelCode: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Action/Type/Relaunch?ParcelCode=${parcelCode}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async relaunchNew(parcelCode: string, data: any) {
    try {
      const form = new FormData();
      Object.keys(data).forEach(key => form.append(key, String(data[key])));
      const response = await axios.post(`${this.baseUrl}/Action/Type/RelaunchNew?ParcelCode=${parcelCode}`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getParcelsList(params: any = {}) {
    try {
      const form = new FormData();
      const defaultParams = {
        start: '0',
        length: '10',
        'search[value]': '',
        'search[regex]': 'false',
        business: '',
        team: '',
        city: '',
        situation: '',
        statut: '',
        statut_s: '',
        type: '',
        date_type: '',
        'date[from]': '01/01/2020',
        'date[to]': new Date().toLocaleDateString('en-US'),
        all_data: '1'
      };
      const finalParams = { ...defaultParams, ...params };
      Object.keys(finalParams).forEach(key => form.append(key, String(finalParams[key])));
      const response = await axios.post(`${this.baseUrl}/Json`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async addDeliveryNote() {
    try {
      const form = new FormData();
      form.append('business', '2');
      const response = await axios.post('https://api.ameex.app/customer/Delivery/DeliveryNotes/Action/Type/Add', form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async addParcelsToNote(ref: string, parcels: string[]) {
    try {
      const form = new FormData();
      parcels.forEach(p => form.append('parcels[]', p));
      const response = await axios.post(`https://api.ameex.app/customer/Delivery/DeliveryNotes/Action/Type/AddParcels?Ref=${ref}`, form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteDeliveryNote(ref: string) {
    try {
      const response = await axios.delete(`https://api.ameex.app/customer/Delivery/DeliveryNotes/Action/Type/Delete?Ref=${ref}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  getPrintLabelUrl(ref: string, labelType: string = 'Label_100_100') {
    return `https://api.ameex.app/customer/Delivery/DeliveryNotes/Print/Type/Labels?Ref=${ref}&LabelType=${labelType}`;
  }

  getPrintNoteUrl(ref: string) {
    return `https://api.ameex.app/customer/Delivery/DeliveryNotes/Print/Type/Note?Ref=${ref}`;
  }

  async addPickupRequest(data: any) {
    try {
      const form = new FormData();
      form.append('mdl_business', '2');
      form.append('mdl_type', 'PARCEL_M');
      form.append('mdl_city', String(data.city));
      form.append('p_address', data.address);
      form.append('p_phone', data.phone.replace(/\s/g, ''));
      form.append('p_note', data.note || '');
      const response = await axios.post('https://api.ameex.app/customer/Delivery/PickupRequests/Action/Type/Add', form, {
        headers: this.getHeaders(form.getHeaders())
      });
      return response.data;
    } catch (error: any) {
      throw error;
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
