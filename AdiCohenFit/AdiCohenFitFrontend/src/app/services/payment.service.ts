import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment;

  constructor(private http: HttpClient) { }

  /**
   * Process credit card payment
   */
  processCardPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/process-card`, paymentData);
  }

  /**
   * Get PayPal redirect URL
   */
  getPayPalRedirectUrl(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/paypal/create`, paymentData);
  }

  /**
   * Verify PayPal payment after return from PayPal
   */
  verifyPayPalPayment(paymentId: string, PayerID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/paypal/execute`, { paymentId, PayerID });
  }

  /**
   * Get payment receipt
   */
  getPaymentReceipt(transactionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/receipt/${transactionId}`);
  }
}