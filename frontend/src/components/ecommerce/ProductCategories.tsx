import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  image_url: string | null;
  product_count: number;
}

const ProductCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8002/api/v1/kategorien');
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Kategorien');
        setLoading(false);
        console.error('Fehler beim Laden der Kategorien:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products/category/${categoryId}`);
  };

  // Funktion, um Kategorien in eine hierarchische Struktur zu organisieren
  const organizeCategories = (categories: Category[]) => {
    const rootCategories = categories.filter(cat => cat.parent_id === null);
    const childCategories = categories.filter(cat => cat.parent_id !== null);
    
    // Für einfachere Beispieldarstellung zeigen wir nur die Hauptkategorien
    return rootCategories;
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

  const rootCategories = organizeCategories(categories);

  return (
    <Container className="my-4">
      <h2 className="mb-4">Produktkategorien</h2>
      
      {rootCategories.length === 0 ? (
        <Alert variant="info">
          Keine Kategorien gefunden.
        </Alert>
      ) : (
        <Row>
          {rootCategories.map(category => (
            <Col key={category.id} md={4} className="mb-4">
              <Card 
                className="h-100 category-card"
                onClick={() => handleCategoryClick(category.id)}
                style={{ cursor: 'pointer' }}
              >
                {category.image_url && (
                  <Card.Img 
                    variant="top" 
                    src={category.image_url} 
                    alt={category.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{category.name}</Card.Title>
                  {category.description && (
                    <Card.Text>{category.description}</Card.Text>
                  )}
                  <Card.Text className="text-muted">
                    {category.product_count} {category.product_count === 1 ? 'Produkt' : 'Produkte'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <div className="mt-5">
        <h3>Alle Kategorien</h3>
        <ListGroup>
          {categories.map(category => (
            <ListGroup.Item 
              key={category.id}
              action 
              onClick={() => handleCategoryClick(category.id)}
              className="d-flex justify-content-between align-items-center"
            >
              <div>{category.name}</div>
              <span className="badge bg-primary rounded-pill">
                {category.product_count}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </Container>
  );
};

export default ProductCategories; 