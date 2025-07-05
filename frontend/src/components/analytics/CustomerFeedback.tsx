import React, { useState } from 'react';
import { Card, Input, Button, Alert, Progress } from 'antd';
import axios from 'axios';

const { TextArea } = Input;

interface FeedbackAnalysis {
  sentiment: string;
  confidence: number;
  text_length: number;
  language: string;
}

export const CustomerFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);

  const analyzeFeedback = async () => {
    if (!feedback.trim()) {
      setError('Bitte geben Sie einen Text ein');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<FeedbackAnalysis>(
        '/api/analytics/customer-feedback',
        { feedback_text: feedback }
      );
      setAnalysis(response.data);
    } catch (err) {
      setError('Fehler bei der Analyse des Feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '#52c41a';
      case 'negative':
        return '#f5222d';
      default:
        return '#faad14';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'Positiv';
      case 'negative':
        return 'Negativ';
      default:
        return 'Neutral';
    }
  };

  return (
    <div className="customer-feedback">
      <Card title="Kundenfeedback-Analyse" className="feedback-card">
        <div className="feedback-input">
          <TextArea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Geben Sie hier das Kundenfeedback ein..."
            style={{ marginBottom: 20 }}
          />
          <Button
            type="primary"
            onClick={analyzeFeedback}
            loading={loading}
            style={{ marginBottom: 20 }}
          >
            Feedback analysieren
          </Button>
        </div>

        {error && (
          <Alert
            message="Fehler"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        {analysis && (
          <div className="analysis-results">
            <Card type="inner" title="Analyseergebnisse">
              <div className="sentiment-container">
                <h3>Stimmung</h3>
                <div
                  className="sentiment-indicator"
                  style={{
                    color: getSentimentColor(analysis.sentiment),
                    marginBottom: 20,
                  }}
                >
                  {getSentimentText(analysis.sentiment)}
                </div>
                <Progress
                  percent={Math.round(analysis.confidence * 100)}
                  status="active"
                  strokeColor={getSentimentColor(analysis.sentiment)}
                />
              </div>

              <div className="metrics-container">
                <div className="metric">
                  <span className="metric-label">Textlänge:</span>
                  <span className="metric-value">{analysis.text_length} Zeichen</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sprache:</span>
                  <span className="metric-value">{analysis.language.toUpperCase()}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}; 