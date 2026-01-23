import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../components/ui/sheet';
import { toast } from 'sonner';
import { 
  ArrowLeft, Book, Zap, Key, Code, CreditCard, AlertCircle, 
  CheckCircle, Copy, Menu, Home, ChevronRight, BarChart3,
  Activity, Clock, TrendingUp, Users, FileText, Settings,
  ExternalLink, Search, Terminal, Globe
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DocsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeSection, setActiveSection] = useState('intro');
  const [metrics, setMetrics] = useState({ credits: 0, apiCalls: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'intro', title: 'Introducción', icon: Book, category: 'COMENZAR' },
    { id: 'quickstart', title: 'Inicio Rápido', icon: Zap, category: 'COMENZAR' },
    { id: 'api-key', title: 'API Key', icon: Key, category: 'AUTENTICACIÓN' },
    { id: 'usage', title: 'Uso de la API', icon: Code, category: 'API' },
    { id: 'endpoints', title: 'Endpoints', icon: Globe, category: 'API' },
    { id: 'examples', title: 'Ejemplos', icon: Terminal, category: 'API' },
    { id: 'consumption', title: 'Uso y Consumo', icon: BarChart3, category: 'FACTURACIÓN' },
    { id: 'pricing', title: 'Precios', icon: CreditCard, category: 'FACTURACIÓN' },
    { id: 'errors', title: 'Errores', icon: AlertCircle, category: 'REFERENCIA' },
    { id: 'best-practices', title: 'Buenas Prácticas', icon: CheckCircle, category: 'REFERENCIA' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/usage`);
      setMetrics({ credits: response.data.credits, apiCalls: 0 });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copiado al portapapeles');
  };

  const CodeBlock = ({ code, language = 'bash', title }) => (
    <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
      {title && (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
          {title}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm text-zinc-300">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 text-zinc-400 hover:text-white"
        onClick={() => copyCode(code)}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  const SidebarContent = () => {
    const categories = [...new Set(sections.map(s => s.category))];
    
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Brainyx Docs</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-3">
          {categories.map((category) => (
            <div key={category} className="mb-4">
              <p className="px-3 py-2 text-xs font-semibold text-zinc-500 tracking-wider">{category}</p>
              <div className="space-y-1">
                {sections
                  .filter(s => s.category === category)
                  .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                        activeSection === section.id 
                          ? 'bg-violet-500/20 text-violet-400 border-l-2 border-violet-500' 
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* User Metrics */}
        {isAuthenticated && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500">TU CUENTA</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="h-6 px-2">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Créditos</span>
                <span className="text-sm font-semibold text-violet-400">{metrics.credits.toLocaleString()}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-purple-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min((metrics.credits / 100000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-zinc-800 flex-col fixed h-full bg-zinc-950">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        {/* Toolbar */}
        <header className="sticky top-0 z-10 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center px-4 gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-zinc-950 border-zinc-800">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-zinc-400 hover:text-white">
              <Home className="w-4 h-4" />
            </Button>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-zinc-400">Docs</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-white">{sections.find(s => s.id === activeSection)?.title}</span>
          </div>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Key className="w-4 h-4 mr-2" />
                Mis API Keys
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/register')} className="bg-violet-600 hover:bg-violet-700">
                Crear Cuenta
              </Button>
            )}
          </div>
        </header>

        {/* Metrics Bar (for authenticated users) */}
        {isAuthenticated && (
          <div className="border-b border-zinc-800 bg-zinc-900/30 px-6 py-3">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-zinc-400">Estado:</span>
                <span className="text-emerald-400 font-medium">Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <span className="text-zinc-400">Créditos:</span>
                <span className="text-violet-400 font-medium">{metrics.credits.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">Plan:</span>
                <span className="text-white font-medium">{user?.plan === 'free' ? 'Gratuito' : user?.plan || 'Gratuito'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'intro' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">Introducción a Brainyx</h1>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                      Brainyx es una API de inteligencia artificial de última generación que permite a los desarrolladores 
                      integrar capacidades avanzadas de procesamiento de lenguaje natural en sus aplicaciones.
                    </p>
                  </div>

                  <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Comienza en minutos</h3>
                          <p className="text-zinc-400 text-sm">
                            Regístrate, genera tu API Key y comienza a hacer peticiones en menos de 5 minutos.
                          </p>
                          <Button size="sm" className="mt-4 bg-violet-600 hover:bg-violet-700" onClick={() => setActiveSection('quickstart')}>
                            Ver Inicio Rápido <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setActiveSection('usage')}>
                      <CardContent className="p-5">
                        <Code className="w-8 h-8 text-emerald-500 mb-3" />
                        <h3 className="font-semibold mb-2">Referencia de API</h3>
                        <p className="text-sm text-zinc-400">Documentación completa de todos los endpoints disponibles.</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setActiveSection('examples')}>
                      <CardContent className="p-5">
                        <Terminal className="w-8 h-8 text-blue-500 mb-3" />
                        <h3 className="font-semibold mb-2">Ejemplos de Código</h3>
                        <p className="text-sm text-zinc-400">Ejemplos en cURL, JavaScript, Python y más.</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Capacidades</h2>
                    <div className="grid gap-3">
                      {[
                        'Comprensión y generación de texto en múltiples idiomas',
                        'Respuestas contextuales y coherentes',
                        'Personalización mediante system prompts',
                        'Alta disponibilidad y baja latencia',
                        'Precios accesibles y transparentes'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-zinc-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'quickstart' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">🚀 Inicio Rápido</h1>
                    <p className="text-lg text-zinc-400">Comienza a usar Brainyx en 4 sencillos pasos.</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { step: 1, title: 'Crear cuenta', desc: 'Regístrate en Brainyx con tu email.', action: () => navigate('/register'), actionText: 'Crear cuenta' },
                      { step: 2, title: 'Generar API Key', desc: 'Ve a Ajustes → API Keys y crea una nueva llave.', action: () => navigate('/settings'), actionText: 'Ir a Ajustes' },
                      { step: 3, title: 'Copiar API Key', desc: 'Guarda tu API Key en un lugar seguro. Solo se muestra una vez.' },
                      { step: 4, title: 'Hacer tu primera petición', desc: 'Usa el siguiente comando para probar la API.' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-400 font-bold">{item.step}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-zinc-400 mb-3">{item.desc}</p>
                          {item.action && (
                            <Button size="sm" variant="outline" onClick={item.action} className="border-zinc-700">
                              {item.actionText} <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <CodeBlock 
                    title="Terminal" 
                    code={`curl -X POST https://tu-backend.onrender.com/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: byx_tu_api_key_aqui" \\
  -d '{"message": "Hola Brainyx!"}'`} 
                  />
                </div>
              )}

              {activeSection === 'api-key' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">🔑 API Key</h1>
                    <p className="text-lg text-zinc-400">Todo lo que necesitas saber sobre las API Keys de Brainyx.</p>
                  </div>

                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-400 mb-1">Importante</h3>
                          <p className="text-sm text-zinc-300">
                            Nunca compartas tu API Key ni la expongas en código público. Trátala como una contraseña.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">¿Cómo crear una API Key?</h2>
                    <ol className="space-y-3">
                      {[
                        'Inicia sesión en tu cuenta de Brainyx',
                        'Ve a Ajustes → API Keys',
                        'Haz clic en "Nueva API Key"',
                        'Ingresa un nombre descriptivo (ej: "Mi App Web")',
                        'Copia y guarda la llave inmediatamente'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                          <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-medium">{i + 1}</span>
                          <span className="text-zinc-300">{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Formato de la API Key</h2>
                    <CodeBlock code="byx_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0" title="Ejemplo" />
                    <p className="text-sm text-zinc-500 mt-2">Todas las API Keys de Brainyx comienzan con el prefijo <code className="text-violet-400">byx_</code></p>
                  </div>
                </div>
              )}

              {activeSection === 'usage' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">📡 Uso de la API</h1>
                    <p className="text-lg text-zinc-400">Aprende a integrar Brainyx en tu aplicación.</p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
                    <CodeBlock code="https://tu-backend.onrender.com/api" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Autenticación</h2>
                    <p className="text-zinc-400 mb-4">Todas las peticiones requieren el header <code className="text-violet-400">X-API-Key</code>:</p>
                    <CodeBlock 
                      title="Headers" 
                      code={`Content-Type: application/json
X-API-Key: byx_tu_api_key`} 
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Request Body</h2>
                    <CodeBlock 
                      title="JSON" 
                      code={`{
  "message": "Tu pregunta o mensaje aquí",
  "system_prompt": "Opcional: instrucciones para la IA"
}`} 
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Response</h2>
                    <CodeBlock 
                      title="JSON" 
                      code={`{
  "response": "Respuesta de Brainyx...",
  "credits_remaining": 999
}`} 
                    />
                  </div>
                </div>
              )}

              {activeSection === 'endpoints' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">🌐 Endpoints</h1>
                    <p className="text-lg text-zinc-400">Lista completa de endpoints disponibles.</p>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                          <code className="text-white">/api/v1/chat</code>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-400 text-sm mb-4">Envía un mensaje a Brainyx y recibe una respuesta de IA.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-zinc-500 mb-2">PARÁMETROS</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <code className="text-violet-400">message</code>
                                <span className="text-zinc-500">string, requerido</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <code className="text-violet-400">system_prompt</code>
                                <span className="text-zinc-500">string, opcional</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-2">HEADERS</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <code className="text-violet-400">X-API-Key</code>
                                <span className="text-zinc-500">requerido</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === 'examples' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">💻 Ejemplos de Código</h1>
                    <p className="text-lg text-zinc-400">Ejemplos prácticos para diferentes lenguajes.</p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">cURL</h2>
                    <CodeBlock 
                      title="Terminal" 
                      code={`curl -X POST https://tu-backend.onrender.com/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: byx_tu_api_key" \\
  -d '{"message": "¿Qué es machine learning?"}'`} 
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">JavaScript (Fetch)</h2>
                    <CodeBlock 
                      title="index.js" 
                      code={`const response = await fetch('https://tu-backend.onrender.com/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'byx_tu_api_key'
  },
  body: JSON.stringify({
    message: '¿Qué es machine learning?'
  })
});

const data = await response.json();
console.log(data.response);`} 
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">Python (Requests)</h2>
                    <CodeBlock 
                      title="main.py" 
                      code={`import requests

response = requests.post(
    'https://tu-backend.onrender.com/api/v1/chat',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'byx_tu_api_key'
    },
    json={
        'message': '¿Qué es machine learning?'
    }
)

print(response.json()['response'])`} 
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-3">Node.js (Axios)</h2>
                    <CodeBlock 
                      title="app.js" 
                      code={`const axios = require('axios');

const response = await axios.post(
  'https://tu-backend.onrender.com/api/v1/chat',
  { message: '¿Qué es machine learning?' },
  {
    headers: {
      'X-API-Key': 'byx_tu_api_key'
    }
  }
);

console.log(response.data.response);`} 
                    />
                  </div>
                </div>
              )}

              {activeSection === 'consumption' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">📊 Uso y Consumo</h1>
                    <p className="text-lg text-zinc-400">Entiende cómo funciona el sistema de créditos.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-5 text-center">
                        <p className="text-4xl font-bold text-violet-400">1</p>
                        <p className="text-sm text-zinc-400 mt-1">crédito por petición</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-5 text-center">
                        <p className="text-4xl font-bold text-emerald-400">1,000</p>
                        <p className="text-sm text-zinc-400 mt-1">créditos gratis al registrarte</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-5 text-center">
                        <p className="text-4xl font-bold text-amber-400">0</p>
                        <p className="text-sm text-zinc-400 mt-1">= acceso bloqueado</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">¿Cómo recargar créditos?</h2>
                    <div className="space-y-3">
                      {[
                        'Inicia sesión en tu cuenta',
                        'Ve a Ajustes → Planes',
                        'Selecciona un plan',
                        'Los créditos se añaden inmediatamente'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">{i + 1}</span>
                          <span className="text-zinc-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'pricing' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">💳 Precios</h1>
                    <p className="text-lg text-zinc-400">Planes simples y económicos para todos.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { name: 'Promoción', price: 250, credits: 50000, desc: 'Ideal para proyectos pequeños' },
                      { name: 'Estándar', price: 400, credits: 100000, desc: 'Para uso regular', popular: true },
                      { name: 'Premium', price: 500, credits: 200000, desc: 'Uso profesional' },
                    ].map((plan) => (
                      <Card key={plan.name} className={`bg-zinc-900 ${plan.popular ? 'border-violet-500 ring-1 ring-violet-500' : 'border-zinc-800'}`}>
                        {plan.popular && (
                          <div className="bg-violet-500 text-white text-xs font-semibold text-center py-1">MÁS POPULAR</div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                          <p className="text-sm text-zinc-500 mb-4">{plan.desc}</p>
                          <p className="text-4xl font-bold mb-1">${plan.price}</p>
                          <p className="text-zinc-500 text-sm mb-4">USD</p>
                          <div className="py-3 px-4 bg-zinc-800 rounded-lg text-center">
                            <p className="text-2xl font-semibold text-violet-400">{plan.credits.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500">créditos</p>
                          </div>
                          <Button className="w-full mt-4" variant={plan.popular ? 'default' : 'outline'} onClick={() => navigate('/settings')}>
                            Comprar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'errors' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">❌ Errores Comunes</h1>
                    <p className="text-lg text-zinc-400">Códigos de error y cómo solucionarlos.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { code: 401, title: 'API Key inválida', desc: 'La API Key no existe o está mal formateada.', solution: 'Verifica que tu API Key sea correcta y comience con byx_' },
                      { code: 402, title: 'Saldo agotado', desc: 'No tienes créditos disponibles.', solution: 'Recarga créditos comprando un plan.' },
                      { code: 429, title: 'Límite excedido', desc: 'Demasiadas peticiones en poco tiempo.', solution: 'Espera unos segundos e intenta de nuevo.' },
                      { code: 500, title: 'Error interno', desc: 'Error en el servidor.', solution: 'Intenta más tarde o contacta soporte.' },
                    ].map((error) => (
                      <Card key={error.code} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <span className={`px-3 py-1 rounded font-mono text-sm ${
                              error.code === 401 ? 'bg-red-500/20 text-red-400' :
                              error.code === 402 ? 'bg-amber-500/20 text-amber-400' :
                              error.code === 429 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-zinc-700 text-zinc-300'
                            }`}>{error.code}</span>
                            <div>
                              <h3 className="font-semibold">{error.title}</h3>
                              <p className="text-sm text-zinc-400 mt-1">{error.desc}</p>
                              <p className="text-sm text-emerald-400 mt-2">✓ {error.solution}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'best-practices' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">✨ Buenas Prácticas</h1>
                    <p className="text-lg text-zinc-400">Recomendaciones para usar Brainyx de forma óptima.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: '🎯', title: 'Sé específico', desc: 'Prompts claros y detallados generan mejores respuestas y ahorran créditos.' },
                      { icon: '🔒', title: 'Protege tu API Key', desc: 'Nunca la expongas en código frontend. Usa variables de entorno en el backend.' },
                      { icon: '⚡', title: 'Maneja errores', desc: 'Implementa retry logic para errores 429 y muestra mensajes claros al usuario.' },
                      { icon: '📊', title: 'Monitorea el uso', desc: 'Revisa tus créditos regularmente para evitar interrupciones.' },
                      { icon: '🔄', title: 'Usa system prompts', desc: 'Personaliza el comportamiento de la IA para tu caso de uso específico.' },
                    ].map((tip, i) => (
                      <Card key={i} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <span className="text-2xl">{tip.icon}</span>
                            <div>
                              <h3 className="font-semibold">{tip.title}</h3>
                              <p className="text-sm text-zinc-400 mt-1">{tip.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DocsPage;
