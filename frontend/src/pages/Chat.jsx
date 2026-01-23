import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Trash2,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ChatMessage = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`max-w-[80%] md:max-w-[70%] px-5 py-3 ${
        isUser
          ? 'chat-bubble-user'
          : 'chat-bubble-ai'
      }`}
    >
      {!isUser && (
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>Brainyx</span>
        </div>
      )}
      <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
    </div>
  </motion.div>
);

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex justify-start mb-4"
  >
    <div className="chat-bubble-ai px-5 py-4">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </motion.div>
);

const Chat = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/conversations`);
      setConversations(response.data);
      if (response.data.length > 0 && !activeConversation) {
        selectConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    try {
      const response = await axios.get(`${API_URL}/chat/conversations/${conversation.id}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Error al cargar la conversación');
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post(`${API_URL}/chat/conversations`);
      const newConv = response.data;
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
    } catch (error) {
      toast.error('Error al crear nueva conversación');
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/chat/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversation?.id === convId) {
        setActiveConversation(null);
        setMessages([]);
      }
      toast.success('Conversación eliminada');
    } catch (error) {
      toast.error('Error al eliminar la conversación');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    if (!activeConversation) {
      await createNewConversation();
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/chat/conversations/${activeConversation.id}/messages`,
        { content: userMessage.content }
      );
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      toast.error('Error al enviar el mensaje');
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Sesión cerrada');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="sidebar flex flex-col h-full z-20 fixed md:relative"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold font-['Outfit']">Chats</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden"
                  data-testid="close-sidebar-btn"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <Button
                onClick={createNewConversation}
                className="w-full rounded-full btn-hover"
                data-testid="new-chat-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Conversación
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => selectConversation(conv)}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">
                      {conv.messages?.[0]?.content?.substring(0, 30) || 'Nueva conversación'}
                      {conv.messages?.[0]?.content?.length > 30 && '...'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteConversation(conv.id, e)}
                      data-testid={`delete-conv-${conv.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl"
                onClick={() => navigate('/profile')}
                data-testid="profile-nav-btn"
              >
                <User className="w-4 h-4 mr-3" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl"
                onClick={() => navigate('/settings')}
                data-testid="settings-nav-btn"
              >
                <Settings className="w-4 h-4 mr-3" />
                Configuración
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl"
                onClick={toggleTheme}
                data-testid="theme-toggle-btn"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 mr-3" />
                ) : (
                  <Moon className="w-4 h-4 mr-3" />
                )}
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-destructive hover:text-destructive"
                onClick={handleLogout}
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <header className="h-16 border-b border-border flex items-center px-4 gap-4 glass">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              data-testid="open-sidebar-btn"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="font-semibold font-['Outfit']">
              {activeConversation ? 'Chat con IA' : 'Bienvenido'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {user?.name && `Hola, ${user.name}`}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-btn">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {user?.profile_image ? (
                    <img src={user.profile_image} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="dropdown-profile">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} data-testid="dropdown-settings">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="dropdown-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="empty-state h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-semibold font-['Outfit']">¡Hola! Soy Brainyx</h2>
                  <p className="text-muted-foreground max-w-md">
                    Estoy aquí para ayudarte. Puedes preguntarme lo que quieras y te responderé de la mejor manera posible.
                  </p>
                </motion.div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={message.role === 'user'}
                  />
                ))}
                <AnimatePresence>
                  {loading && <TypingIndicator />}
                </AnimatePresence>
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-2 bg-card/50 backdrop-blur-md border border-border rounded-full shadow-sm">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                disabled={loading}
                data-testid="chat-input"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || loading}
                className="rounded-full h-10 w-10 p-0 btn-hover"
                data-testid="send-message-btn"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;
