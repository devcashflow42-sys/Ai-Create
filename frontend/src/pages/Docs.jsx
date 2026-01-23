import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  ArrowLeft, Book, Zap, Key, Code, CreditCard, AlertCircle, 
  CheckCircle, Copy, Menu, X, Home
} from 'lucide-react';
import { toast } from 'sonner';

const DocsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('intro');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sections = [
    { id: 'intro', title: 'Introducción', icon: Book },
    { id: 'quickstart', title: 'Inicio Rápido', icon: Zap },
    { id: 'api-key', title: 'API Key', icon: Key },
    { id: 'usage', title: 'Uso de la API', icon: Code },
    { id: 'consumption', title: 'Uso y Consumo', icon: CreditCard },
    { id: 'pricing', title: 'Precios', icon: CreditCard },
    { id: 'errors', title: 'Errores Comunes', icon: AlertCircle },
    { id: 'best-practices', title: 'Buenas Prácticas', icon: CheckCircle },
  ];

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado');
  };

  const CodeBlock = ({ code, language = 'bash' }) => (
    <div className="relative group">
      <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyCode(code)}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-border bg-card/50 fixed h-full z-20 md:relative overflow-hidden`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-bold font-['Outfit'] text-lg">Brainyx Docs</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <nav className="p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeSection === section.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center px-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
            <Home className="w-4 h-4 mr-2" /> Inicio
          </Button>
          <span className="text-muted-foreground">Documentación</span>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6 md:p-12">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-zinc dark:prose-invert max-w-none"
          >
            {activeSection === 'intro' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">Introducción a Brainyx</h1>
                <p className="text-lg text-muted-foreground">
                  Brainyx es una inteligencia artificial avanzada diseñada para ayudarte a resolver problemas, 
                  generar contenido y automatizar tareas mediante una API simple y potente.
                </p>
                
                <h2 className="text-2xl font-semibold font-['Outfit'] mt-8">¿Qué es Brainyx?</h2>
                <p>
                  Brainyx es una API de inteligencia artificial que te permite integrar capacidades de 
                  procesamiento de lenguaje natural en tus aplicaciones. Basada en modelos avanzados de IA, 
                  Brainyx puede:
                </p>
                <ul className="space-y-2">
                  <li>✅ Responder preguntas complejas</li>
                  <li>✅ Generar contenido creativo</li>
                  <li>✅ Asistir en programación</li>
                  <li>✅ Analizar y resumir textos</li>
                  <li>✅ Automatizar tareas repetitivas</li>
                </ul>

                <h2 className="text-2xl font-semibold font-['Outfit'] mt-8">¿Para quién es?</h2>
                <p>
                  Brainyx está diseñada para desarrolladores, empresas y emprendedores que buscan 
                  integrar inteligencia artificial en sus productos de manera rápida y económica.
                </p>
              </div>
            )}

            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">🚀 Inicio Rápido</h1>
                <p className="text-lg text-muted-foreground">
                  Comienza a usar Brainyx en menos de 5 minutos.
                </p>

                <div className="space-y-8">
                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                      Crear cuenta en Brainyx
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Regístrate en <a href="/register" className="text-primary hover:underline">brainyx.com/register</a> con tu email.
                    </p>
                  </div>

                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                      Ir a Ajustes → API Keys
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Una vez dentro, ve a la sección de Ajustes y selecciona "API Keys".
                    </p>
                  </div>

                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                      Generar API Key
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Haz clic en "Nueva API Key", ingresa un nombre y genera tu llave.
                    </p>
                  </div>

                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                      Realizar tu primera petición
                    </h3>
                    <CodeBlock code={`curl -X POST https://tu-backend.onrender.com/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: byx_tu_api_key_aqui" \\
  -d '{"message": "Hola Brainyx, ¿cómo estás?"}'`} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'api-key' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">🔑 API Key</h1>
                
                <h2 className="text-2xl font-semibold mt-8">¿Qué es una API Key?</h2>
                <p>
                  Una API Key es una llave única que identifica tu cuenta y te permite acceder a la API de Brainyx.
                  Cada petición debe incluir tu API Key en el header.
                </p>

                <h2 className="text-2xl font-semibold mt-8">Cómo crear una API Key</h2>
                <ol className="space-y-2">
                  <li>1. Inicia sesión en Brainyx</li>
                  <li>2. Ve a <strong>Ajustes → API Keys</strong></li>
                  <li>3. Clic en <strong>"Nueva API Key"</strong></li>
                  <li>4. Ingresa un nombre descriptivo</li>
                  <li>5. <strong>Guarda la llave</strong> - solo se muestra una vez</li>
                </ol>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mt-6">
                  <h3 className="font-semibold text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Reglas de Seguridad
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>❌ No compartas tu API Key con nadie</li>
                    <li>❌ No expongas la API Key en código frontend público</li>
                    <li>❌ No subas la API Key a repositorios públicos</li>
                    <li>✅ Usa variables de entorno para almacenarla</li>
                    <li>✅ Rota las llaves periódicamente</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'usage' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">📡 Uso de la API</h1>

                <h2 className="text-2xl font-semibold mt-8">Endpoint Principal</h2>
                <CodeBlock code="POST /api/v1/chat" />

                <h2 className="text-2xl font-semibold mt-8">Headers Requeridos</h2>
                <CodeBlock code={`Content-Type: application/json
X-API-Key: byx_tu_api_key_aqui`} />

                <h2 className="text-2xl font-semibold mt-8">Body de la Petición</h2>
                <CodeBlock code={`{
  "message": "Tu mensaje aquí",
  "system_prompt": "Opcional: instrucciones para la IA"
}`} />

                <h2 className="text-2xl font-semibold mt-8">Ejemplos</h2>

                <h3 className="text-xl font-semibold mt-6">cURL</h3>
                <CodeBlock code={`curl -X POST https://tu-backend.onrender.com/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: byx_tu_api_key" \\
  -d '{"message": "Explica qué es machine learning"}'`} />

                <h3 className="text-xl font-semibold mt-6">JavaScript</h3>
                <CodeBlock code={`const response = await fetch('https://tu-backend.onrender.com/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'byx_tu_api_key'
  },
  body: JSON.stringify({
    message: 'Explica qué es machine learning'
  })
});

const data = await response.json();
console.log(data.response);`} />

                <h3 className="text-xl font-semibold mt-6">Python</h3>
                <CodeBlock code={`import requests

response = requests.post(
    'https://tu-backend.onrender.com/api/v1/chat',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'byx_tu_api_key'
    },
    json={
        'message': 'Explica qué es machine learning'
    }
)

print(response.json()['response'])`} />

                <h2 className="text-2xl font-semibold mt-8">Respuesta</h2>
                <CodeBlock code={`{
  "response": "Machine learning es una rama de la IA...",
  "credits_remaining": 999
}`} />
              </div>
            )}

            {activeSection === 'consumption' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">📊 Uso y Consumo</h1>

                <h2 className="text-2xl font-semibold mt-8">¿Cómo se descuentan los créditos?</h2>
                <p>
                  Cada petición a la API consume <strong>1 crédito</strong>. Los créditos se descuentan 
                  automáticamente de tu saldo al recibir una respuesta exitosa.
                </p>

                <h2 className="text-2xl font-semibold mt-8">¿Qué pasa cuando se agotan?</h2>
                <p>
                  Cuando tu saldo llega a 0:
                </p>
                <ul className="space-y-2">
                  <li>❌ Las peticiones a la API retornarán error 402</li>
                  <li>❌ El chat interno también se bloqueará</li>
                  <li>✅ Puedes recargar comprando un nuevo plan</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8">¿Cómo recargar?</h2>
                <ol className="space-y-2">
                  <li>1. Ve a <strong>Ajustes → Planes</strong></li>
                  <li>2. Selecciona un plan</li>
                  <li>3. Realiza el pago</li>
                  <li>4. Los créditos se añaden inmediatamente</li>
                </ol>
              </div>
            )}

            {activeSection === 'pricing' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">💳 Precios</h1>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 border rounded-2xl">
                    <h3 className="text-xl font-semibold">Plan Promoción</h3>
                    <p className="text-3xl font-bold mt-2">$250 <span className="text-sm font-normal">USD</span></p>
                    <p className="text-muted-foreground mt-2">50,000 créditos</p>
                    <p className="text-sm text-muted-foreground mt-4">Ideal para proyectos pequeños y pruebas.</p>
                  </div>
                  <div className="p-6 border-2 border-primary rounded-2xl">
                    <h3 className="text-xl font-semibold">Plan Estándar</h3>
                    <p className="text-3xl font-bold mt-2">$400 <span className="text-sm font-normal">USD</span></p>
                    <p className="text-muted-foreground mt-2">100,000 créditos</p>
                    <p className="text-sm text-muted-foreground mt-4">Para uso regular y proyectos medianos.</p>
                  </div>
                  <div className="p-6 border rounded-2xl">
                    <h3 className="text-xl font-semibold">Plan Premium</h3>
                    <p className="text-3xl font-bold mt-2">$500 <span className="text-sm font-normal">USD</span></p>
                    <p className="text-muted-foreground mt-2">200,000 créditos</p>
                    <p className="text-sm text-muted-foreground mt-4">Uso profesional e ilimitado.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'errors' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">❌ Errores Comunes</h1>

                <div className="space-y-4 mt-8">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <h3 className="font-semibold text-red-500">401 - API Key inválida</h3>
                    <p className="text-sm mt-1">La API Key no existe o está desactivada.</p>
                    <p className="text-sm text-muted-foreground mt-2">Solución: Verifica que la API Key sea correcta y esté activa.</p>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h3 className="font-semibold text-yellow-600">402 - Saldo agotado</h3>
                    <p className="text-sm mt-1">No tienes créditos disponibles.</p>
                    <p className="text-sm text-muted-foreground mt-2">Solución: Compra un plan para recargar créditos.</p>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <h3 className="font-semibold text-orange-500">429 - Límite excedido</h3>
                    <p className="text-sm mt-1">Has excedido el límite de peticiones por minuto.</p>
                    <p className="text-sm text-muted-foreground mt-2">Solución: Espera unos segundos e intenta de nuevo.</p>
                  </div>

                  <div className="p-4 bg-zinc-500/10 border border-zinc-500/30 rounded-xl">
                    <h3 className="font-semibold">500 - Error interno</h3>
                    <p className="text-sm mt-1">Error en el servidor.</p>
                    <p className="text-sm text-muted-foreground mt-2">Solución: Intenta más tarde o contacta soporte.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'best-practices' && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-['Outfit']">📜 Buenas Prácticas</h1>

                <div className="space-y-6 mt-8">
                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold">🎯 Optimiza tus prompts</h3>
                    <p className="mt-2 text-muted-foreground">
                      Sé específico en tus preguntas. Un prompt claro produce mejores respuestas y 
                      reduce el consumo de créditos al evitar peticiones adicionales.
                    </p>
                  </div>

                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold">🔒 Protege tu API Key</h3>
                    <p className="mt-2 text-muted-foreground">
                      Nunca expongas tu API Key en código del lado del cliente. Usa variables de 
                      entorno y realiza las peticiones desde tu backend.
                    </p>
                  </div>

                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold">⚡ Maneja errores correctamente</h3>
                    <p className="mt-2 text-muted-foreground">
                      Implementa manejo de errores para casos como saldo agotado (402) o 
                      límite excedido (429). Muestra mensajes claros a tus usuarios.
                    </p>
                  </div>

                  <div className="p-6 bg-accent/30 rounded-2xl">
                    <h3 className="font-semibold">📊 Monitorea tu uso</h3>
                    <p className="mt-2 text-muted-foreground">
                      Revisa regularmente tu consumo de créditos en el panel de Ajustes 
                      para evitar interrupciones en el servicio.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DocsPage;
