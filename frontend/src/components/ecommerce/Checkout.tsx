import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface CartSummary {
  items: {
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  total: number;
}

interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

const Checkout: React.FC = () => {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // Formulardaten
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    postal_code: '',
    country: 'Deutschland'
  });
  
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  
  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8002/api/v1/warenkorb');
        setCartSummary({
          items: response.data.items || [],
          total: response.data.items.reduce((sum: number, item: any) => sum + item.total, 0)
        });
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden des Warenkorbs');
        setLoading(false);
        console.error('Fehler beim Laden des Warenkorbs:', err);
      }
    };

    fetchCartSummary();
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cartSummary || cartSummary.items.length === 0) {
      setError('Ihr Warenkorb ist leer');
      return;
    }

    try {
      setProcessingOrder(true);
      
      // Bestellung erstellen
      const response = await axios.post('http://localhost:8002/api/v1/ecommerce/bestellungen', {
        shipping_address: address,
        payment_method: paymentMethod
      });
      
      setOrderId(response.data.order_id);
      setOrderSuccess(true);
      setProcessingOrder(false);
      
      // Warenkorb leeren (Server-seitig wird dies normalerweise automatisch gemacht)
      await axios.delete('http://localhost:8002/api/v1/warenkorb/clear');
      
    } catch (err) {
      setError('Fehler bei der Bestellverarbeitung');
      setProcessingOrder(false);
      console.error('Fehler bei der Bestellverarbeitung:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Lädt...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (orderSuccess) {
    return (
      <Container className="my-5">
        <Alert variant="success">
          <Alert.Heading>Vielen Dank für Ihre Bestellung!</Alert.Heading>
          <p>
            Ihre Bestellung mit der Nummer #{orderId} wurde erfolgreich aufgegeben. 
            Sie erhalten in Kürze eine Bestätigung per E-Mail.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-success" onClick={() => navigate('/products')}>
              Zurück zum Shop
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">Kasse</h2>
      
      {(!cartSummary || cartSummary.items.length === 0) ? (
        <Alert variant="info">
          Ihr Warenkorb ist leer. <Button variant="link" onClick={() => navigate('/products')}>Zurück zum Shop</Button>
        </Alert>
      ) : (
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>Lieferadresse</Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Straße und Hausnummer</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="street" 
                      value={address.street}
                      onChange={handleAddressChange}
                      required 
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>PLZ</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="postal_code" 
                          value={address.postal_code}
                          onChange={handleAddressChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stadt</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="city" 
                          value={address.city}
                          onChange={handleAddressChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Land</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="country" 
                      value={address.country}
                      onChange={handleAddressChange}
                      required 
                    />
                  </Form.Group>
                  
                  <Card.Header className="mt-4 mb-3">Zahlungsmethode</Card.Header>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="radio"
                      label="Kreditkarte"
                      name="paymentMethod"
                      value="credit_card"
                      id="payment_credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={handlePaymentMethodChange}
                    />
                    <Form.Check
                      type="radio"
                      label="PayPal"
                      name="paymentMethod"
                      value="paypal"
                      id="payment_paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={handlePaymentMethodChange}
                    />
                    <Form.Check
                      type="radio"
                      label="Rechnung"
                      name="paymentMethod"
                      value="invoice"
                      id="payment_invoice"
                      checked={paymentMethod === 'invoice'}
                      onChange={handlePaymentMethodChange}
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={() => navigate('/cart')}>
                      Zurück zum Warenkorb
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={processingOrder}
                    >
                      {processingOrder ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span className="ms-2">Wird verarbeitet...</span>
                        </>
                      ) : (
                        'Bestellung aufgeben'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header>Bestellübersicht</Card.Header>
              <Card.Body>
                {cartSummary?.items.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between mb-2">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span>{item.total.toFixed(2)} €</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Gesamtsumme</span>
                  <span>{cartSummary?.total.toFixed(2)} €</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Checkout; 