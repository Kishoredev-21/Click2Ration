import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, X, Mic, MicOff, Package, Truck, Fingerprint, CreditCard, Phone, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const RationBot = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: language === 'ta' ? 'பிழை' : 'Error',
          description: language === 'ta' ? 'குரல் அங்கீகாரம் தோல்வியடைந்தது' : 'Voice recognition failed',
          variant: 'destructive',
        });
      };
    }
  }, [language, toast]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: language === 'ta' ? 'குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை' : 'Voice recognition not supported',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rationbot-chat', {
        body: {
          message: textToSend,
          language,
          context: window.location.pathname,
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        role: 'bot',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      speakText(data.response);
    } catch (error: any) {
      console.error('RationBot error:', error);
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: error.message || (language === 'ta' ? 'ஏதோ தவறு நடந்தது' : 'Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: language === 'ta' ? 'அரட்டை அழிக்கப்பட்டது' : 'Chat Cleared',
      description: language === 'ta' ? 'புதிய உரையாடலைத் தொடங்கவும்' : 'Start a new conversation',
    });
  };

  const quickActions = [
    {
      icon: Package,
      label: language === 'ta' ? 'இருப்பு சரிபார்' : 'Check Stock',
      message: language === 'ta' ? 'பொருட்கள் இருப்பு என்ன?' : 'What items are in stock?'
    },
    {
      icon: Truck,
      label: language === 'ta' ? 'விநியோகம் கண்காணி' : 'Track Delivery',
      message: language === 'ta' ? 'என் விநியோக நிலை என்ன?' : 'What is my delivery status?'
    },
    {
      icon: Fingerprint,
      label: language === 'ta' ? 'கைரேகை சரிபார்' : 'Verify Fingerprint',
      message: language === 'ta' ? 'கைரேகை சரிபார்ப்பு எப்படி?' : 'How to verify fingerprint?'
    },
    {
      icon: CreditCard,
      label: language === 'ta' ? 'கட்டண உதவி' : 'Payment Help',
      message: language === 'ta' ? 'கட்டண விருப்பங்கள் என்ன?' : 'What are the payment options?'
    },
    {
      icon: Phone,
      label: language === 'ta' ? 'ஆதரவு தொடர்பு' : 'Contact Support',
      message: language === 'ta' ? 'ஆதரவு எண் என்ன?' : 'What is the support helpline number?'
    }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        size="icon"
      >
        <Bot className="h-7 w-7 text-white" />
      </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-elegant flex flex-col bg-background border-primary/20 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">RationBot</h3>
                <p className="text-xs text-white/80">
                  {language === 'ta' ? 'உங்கள் நட்பான உதவியாளர்' : 'Your friendly assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  title={language === 'ta' ? 'அரட்டை அழி' : 'Clear chat'}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground space-y-4">
                <div className="text-4xl">👋</div>
                <p className="font-medium">
                  {language === 'ta' 
                    ? 'வணக்கம்! நான் RationBot. உங்களுக்கு எப்படி உதவ முடியும்?' 
                    : 'Vanakkam! Naan RationBot. Unga help panna ready!'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-4">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(action.message)}
                      className="flex flex-col h-auto py-3 gap-1 hover:bg-primary/10 hover:border-primary transition-all"
                    >
                      <action.icon className="h-5 w-5 text-primary" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-primary text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button
                onClick={toggleListening}
                variant={isListening ? "default" : "outline"}
                size="icon"
                className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={language === 'ta' ? 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="bg-gradient-primary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default RationBot;
