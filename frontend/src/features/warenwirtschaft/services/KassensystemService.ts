class KassensystemService {
  async processPayment(paymentData: unknown): Promise<unknown> {
    // Implementierung für Zahlungsverarbeitung,
    console.log('Processing payment:', paymentData);
    return { success: true, data: paymentData };
  }
}

export default KassensystemService; 