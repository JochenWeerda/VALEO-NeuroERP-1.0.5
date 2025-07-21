class KassensystemService {
  async processPayment(paymentData: any): Promise<any> {
    // Implementierung für Zahlungsverarbeitung
    console.log('Processing payment:', paymentData);
    return { success: true, data: paymentData };
  }
}

export default KassensystemService; 