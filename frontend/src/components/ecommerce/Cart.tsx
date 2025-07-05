import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8002/api/v1/warenkorb');
      setCartItems(response.data.items || []);
      setLoading(false);
    } catch (err) {
      setError('Fehler beim Laden des Warenkorbs');
      setLoading(false);
      console.error('Fehler beim Laden des Warenkorbs:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(`http://localhost:8002/api/v1/warenkorb/update/${itemId}`, {
        quantity: newQuantity
      });
      await fetchCart(); // Warenkorb neu laden
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Menge:', err);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await axios.delete(`http://localhost:8002/api/v1/warenkorb/remove/${itemId}`);
      await fetchCart(); // Warenkorb neu laden
    } catch (err) {
      console.error('Fehler beim Entfernen des Produkts:', err);
    }
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
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

  const totalSum = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Container className="my-4">
      <h2>Warenkorb</h2>
      
      {cartItems.length === 0 ? (
        <Alert variant="info">
          Ihr Warenkorb ist leer. <Button variant="link" onClick={() => navigate('/products')}>Zurück zum Shop</Button>
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Preis</th>
                <th>Menge</th>
                <th>Gesamt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.price.toFixed(2)} €</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>{item.total.toFixed(2)} €</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Entfernen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end fw-bold">Gesamtsumme:</td>
                <td className="fw-bold">{totalSum.toFixed(2)} €</td>
                <td></td>
              </tr>
            </tfoot>
          </Table>
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={() => navigate('/products')}>
              Weiter einkaufen
            </Button>
            <Button variant="primary" onClick={proceedToCheckout}>
              Zur Kasse
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default Cart; 