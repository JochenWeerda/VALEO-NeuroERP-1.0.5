import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Dashboard.css';
import { LLMService } from '../../services/llmService';

/**
 * Slack-ähnlicher Chat-Bereich mit internem Chat und Kundenchat
 * Mit Toggle-Button zum Ein- und Ausklappen
 */
const ChatPanel = ({ isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState('intern');
  const [messages, setMessages] = useState({
    intern: [
      { id: 1, sender: 'Chatbot', text: 'Willkommen im Folkerts ERP-System! Wie kann ich dir helfen?', isBot: true, time: '09:30' }
    ],
    kunden: [
      { id: 1, sender: 'Chatbot', text: 'Willkommen im Kundensupport. Wie können wir Ihnen helfen?', isBot: true, time: '10:15' }
    ]
  });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Senden einer neuen Nachricht
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const userMessage = {
      id: messages[activeTab].length + 1,
      sender: activeTab === 'intern' ? 'Ich' : 'Ich (Support)',
      text: newMessage,
      isBot: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], userMessage]
    }));
    setNewMessage('');
    setLoading(true);
    // Anfrage an LLMService
    try {
      const botText = await LLMService.sendQuery(newMessage);
      const newBotMessage = {
        id: messages[activeTab].length + 2,
        sender: 'Chatbot',
        text: botText,
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], newBotMessage]
      }));
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], {
          id: messages[activeTab].length + 2,
          sender: 'Chatbot',
          text: 'Entschuldigung, die KI ist derzeit nicht erreichbar.',
          isBot: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <div className="chat-tabs">
          <button 
            className={`chat-tab ${activeTab === 'intern' ? 'active' : ''}`}
            onClick={() => setActiveTab('intern')}
          >
            <span className="material-icons">group</span> Intern
          </button>
          <button 
            className={`chat-tab ${activeTab === 'kunden' ? 'active' : ''}`}
            onClick={() => setActiveTab('kunden')}
          >
            <span className="material-icons">support_agent</span> Kunden
          </button>
        </div>
        <button className="chat-toggle" onClick={onToggle}>
          <span className="material-icons">
            {isOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
      
      <div className="chat-messages">
        {messages[activeTab].map(msg => (
          <div key={msg.id} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="message-header">
              <span className="message-sender">{msg.sender}</span>
              <span className="message-time">{msg.time}</span>
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Nachricht schreiben..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          <span className="material-icons">send</span>
        </button>
      </form>
      
      <div className="chat-help">
        <button onClick={askForHelp}>
          <span className="material-icons">help_outline</span>
          Hilfe vom Bot
        </button>
      </div>
    </div>
  );
};

ChatPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default ChatPanel; 