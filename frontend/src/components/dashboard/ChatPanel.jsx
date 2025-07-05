import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Dashboard.css';

/**
 * Slack-ähnlicher Chat-Bereich mit internem Chat und Kundenchat
 * Mit Toggle-Button zum Ein- und Ausklappen
 */
const ChatPanel = ({ isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState('intern');
  const [messages, setMessages] = useState({
    intern: [
      { id: 1, sender: 'Chatbot', text: 'Willkommen im Folkerts ERP-System! Wie kann ich dir helfen?', isBot: true, time: '09:30' },
      { id: 2, sender: 'Lisa Müller', text: 'Hat jemand schon die neuen Artikel eingepflegt?', isBot: false, time: '09:45' },
      { id: 3, sender: 'Max Folkerts', text: 'Ja, die sind bereits im System. Du findest sie unter Artikel-Stammdaten.', isBot: false, time: '09:47' }
    ],
    kunden: [
      { id: 1, sender: 'Chatbot', text: 'Willkommen im Kundensupport. Wie können wir Ihnen helfen?', isBot: true, time: '10:15' },
      { id: 2, sender: 'Landwirt Janssen', text: 'Wann kann ich mit der Lieferung des Düngers rechnen?', isBot: false, time: '10:20' }
    ]
  });
  const [newMessage, setNewMessage] = useState('');

  // Chat-Bot-Anfrage für Hilfestellung
  const askForHelp = () => {
    const botMessages = {
      'intern': [
        'Du findest die Belegfolgen im ERP-Bereich. Dort sind alle Belege nach Eingang und Ausgang sortiert.',
        'Die Stammdaten befinden sich in den jeweiligen Bereichen CRM, ERP und FIBU.',
        'Für Hilfe bei der Lagerverwaltung gehe zum ERP-Bereich und öffne die Lagerverwaltung-Sektion.'
      ],
      'kunden': [
        'Ihre Aufträge können Sie im Kundenportal unter "Meine Aufträge" einsehen.',
        'Liefertermine werden in der Regel innerhalb von 3-5 Werktagen realisiert.',
        'Für Rückfragen zu Rechnungen wenden Sie sich bitte an unsere Buchhaltung.'
      ]
    };
    
    const randomIndex = Math.floor(Math.random() * botMessages[activeTab].length);
    const botResponse = botMessages[activeTab][randomIndex];
    
    const newBotMessage = {
      id: messages[activeTab].length + 1,
      sender: 'Chatbot',
      text: botResponse,
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newBotMessage]
    }));
  };

  // Senden einer neuen Nachricht
  const handleSendMessage = (e) => {
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
    
    // Bot-Antwort nur, wenn die Nachricht eine Frage ist oder Hilfe erwähnt
    if (newMessage.includes('?') || 
        newMessage.toLowerCase().includes('hilfe') || 
        newMessage.toLowerCase().includes('wie') ||
        newMessage.toLowerCase().includes('wo')) {
      setTimeout(() => {
        askForHelp();
      }, 1000);
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
        />
        <button type="submit">
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