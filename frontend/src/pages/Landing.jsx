import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Settings, User, Sparkles, Brain, Shield, Book, Code, Key } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'IA Conversacional',
      description: 'Interactúa con una inteligencia artificial avanzada que comprende y responde de forma natural.'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Aprendizaje Continuo',
      description: 'La IA mejora con cada conversación, adaptándose a tu estilo de comunicación.'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Personalizable',
      description: 'Configura el comportamiento de la IA según tus necesidades específicas.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Seguro y Privado',
      description: 'Tus datos están protegidos con las mejores prácticas de seguridad.'
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: 'Documentación Completa',
      description: 'Guías detalladas para integrar Brainyx API en tu aplicación, web o servicio.',
      link: '/docs'
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: 'API Key para Desarrolladores',
      description: 'Genera tu API Key y usa Brainyx en cualquier aplicación, HTTP, JavaScript, Python y más.',
      link: '/docs'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg font-['Outfit']">Brainyx</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate('/docs')}
                className="rounded-full hidden md:flex"
                data-testid="docs-nav-btn"
              >
                Documentación
              </Button>
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/chat')}
                  className="rounded-full btn-hover"
                  data-testid="go-to-chat-btn"
                >
                  Ir al Chat
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="rounded-full"
                    data-testid="login-nav-btn"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="rounded-full btn-hover"
                    data-testid="register-nav-btn"
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm tracking-wide uppercase text-secondary font-medium"
                >
                  Inteligencia Artificial Avanzada
                </motion.span>
                <h1 className="text-5xl md:text-7xl tracking-tight leading-none font-semibold font-['Outfit']">
                  Conversa con una IA que{' '}
                  <span className="text-secondary">aprende</span> de ti
                </h1>
              </div>
              
              <p className="text-lg leading-relaxed text-muted-foreground max-w-lg">
                Experimenta el futuro de la comunicación con nuestra plataforma de inteligencia artificial. 
                Respuestas inteligentes, aprendizaje continuo y total personalización.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate(isAuthenticated ? '/chat' : '/register')}
                  className="rounded-full btn-hover text-lg px-8"
                  data-testid="cta-primary-btn"
                >
                  Comenzar Gratis
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="rounded-full text-lg px-8"
                  data-testid="cta-secondary-btn"
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1759157273068-42e6d441f772?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG9yZ2FuaWMlMjBzaGFwZXMlMjBtaW5pbWFsJTIwbmV1dHJhbCUyMGNvbG9yc3xlbnwwfHx8fDE3Njg4ODY3MjF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Abstract organic shapes"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-2xl backdrop-blur-sm"
              />
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full backdrop-blur-sm"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl tracking-tight font-semibold font-['Outfit'] mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para una experiencia de IA excepcional
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-card rounded-2xl border border-border card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold font-['Outfit'] mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl tracking-tight font-semibold font-['Outfit']">
              Listo para empezar?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Únete a miles de usuarios que ya están experimentando el poder de la inteligencia artificial conversacional.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="rounded-full btn-hover text-lg px-12"
              data-testid="cta-final-btn"
            >
              Crear Cuenta Gratis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 lg:px-24 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-medium font-['Outfit']">Brainyx</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Brainyx. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
