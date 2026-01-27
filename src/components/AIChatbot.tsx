import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  ticketId?: string;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ ticketId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Event Flow assistant. How can I help you today? Ask me about gates, directions, wait times, or event information.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const faqDatabase: Record<string, string> = {
    'gate': 'There are 6 gates (A-F) around the stadium. Gate A is North, Gate B is Northeast, Gate C is Southeast, Gate D is South, Gate E is Southwest, and Gate F is Northwest.',
    'wait': 'Wait times vary by gate. Check the dashboard for real-time wait times. Typically, gates with lower capacity utilization have shorter wait times.',
    'direction': 'Use the recommendation system to find the shortest path to your gate. The system considers distance, wait times, and current gate status.',
    'ticket': 'Your ticket contains a QR code. Scan it using the camera, upload an image, or enter the ticket ID manually to access your gate information.',
    'entry': 'Gates open 2 hours before the match. Arrive early to avoid congestion. Use the AI recommendations for optimal arrival time.',
    'parking': 'Parking is available around the stadium. Follow signs and use the recommended routes to your gate.',
    'security': 'Security checks are conducted at all gates. Please arrive early to allow time for security screening.',
    'food': 'Food and beverage vendors are located throughout the stadium. Check the stadium map for locations.',
    'help': 'For assistance, contact stadium staff or use this chatbot. In emergencies, alert security personnel immediately.',
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = userMessage.toLowerCase();

    // Check for keywords and provide relevant answers
    if (lowerMessage.includes('gate') || lowerMessage.includes('entrance')) {
      return faqDatabase['gate'];
    }
    if (lowerMessage.includes('wait') || lowerMessage.includes('time') || lowerMessage.includes('queue')) {
      return faqDatabase['wait'];
    }
    if (lowerMessage.includes('direction') || lowerMessage.includes('path') || lowerMessage.includes('route') || lowerMessage.includes('how to get')) {
      return faqDatabase['direction'];
    }
    if (lowerMessage.includes('ticket') || lowerMessage.includes('qr')) {
      return faqDatabase['ticket'];
    }
    if (lowerMessage.includes('entry') || lowerMessage.includes('arrive') || lowerMessage.includes('when')) {
      return faqDatabase['entry'];
    }
    if (lowerMessage.includes('parking') || lowerMessage.includes('car')) {
      return faqDatabase['parking'];
    }
    if (lowerMessage.includes('security') || lowerMessage.includes('check')) {
      return faqDatabase['security'];
    }
    if (lowerMessage.includes('food') || lowerMessage.includes('drink') || lowerMessage.includes('eat')) {
      return faqDatabase['food'];
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('assistance') || lowerMessage.includes('support')) {
      return faqDatabase['help'];
    }

    // Default response
    return 'I can help you with information about gates, directions, wait times, tickets, entry procedures, parking, security, and more. What would you like to know?';
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await generateResponse(input);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
  };

  const quickQuestions = [
    'Which gate should I use?',
    'What are the wait times?',
    'How do I find my gate?',
    'When do gates open?',
  ];

  return (
    <Card className="glass-card border-primary/30 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          AI Assistant
          {ticketId && (
            <span className="text-xs text-muted-foreground font-normal">
              (Ticket: {ticketId.slice(0, 8)}...)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4" ref={scrollRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about the stadium..."
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatbot;

