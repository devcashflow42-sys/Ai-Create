import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Save, RotateCcw, Moon, Sun, Sparkles } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_PROMPT = `Eres un asistente de inteligencia artificial amigable y útil llamado "Brainyx". 
Tu objetivo es ayudar a los usuarios de manera clara, concisa y empática.
Responde siempre en español a menos que el usuario te hable en otro idioma.
Sé profesional pero accesible, y siempre trata de dar respuestas útiles y bien estructuradas.`;

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSystemPrompt(response.data.system_prompt || DEFAULT_PROMPT);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSystemPrompt(DEFAULT_PROMPT);
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleSavePrompt = async () => {
    if (systemPrompt.length < 10) {
      toast.error('El prompt debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/settings`, { system_prompt: systemPrompt });
      // Update local user state
      if (user) {
        updateUser({ ...user, system_prompt: systemPrompt });
      }
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al guardar la configuración';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_PROMPT);
    toast.info('Prompt restaurado al valor por defecto');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 glass sticky top-0 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/chat')}
          className="mr-4"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Chat
        </Button>
        <h1 className="font-semibold font-['Outfit'] text-lg">Configuración</h1>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Theme Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-['Outfit']">Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label className="text-base">Modo Oscuro</Label>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Activado' : 'Desactivado'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  data-testid="theme-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Prompt Settings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-['Outfit'] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    Prompt del Sistema
                  </CardTitle>
                  <CardDescription>
                    Define cómo debe comportarse la IA en las conversaciones
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fetchingSettings ? (
                <div className="h-48 bg-muted rounded-xl animate-pulse" />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">Instrucciones para la IA</Label>
                    <Textarea
                      id="systemPrompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Escribe las instrucciones para la IA..."
                      className="min-h-[200px] font-mono text-sm rounded-xl resize-y"
                      data-testid="system-prompt-textarea"
                    />
                    <p className="text-xs text-muted-foreground">
                      {systemPrompt.length} caracteres (mínimo 10, máximo 2000)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSavePrompt}
                      className="flex-1 h-12 rounded-full btn-hover"
                      disabled={loading || systemPrompt.length < 10 || systemPrompt.length > 2000}
                      data-testid="save-settings-btn"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetPrompt}
                      className="h-12 rounded-full"
                      data-testid="reset-prompt-btn"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-border bg-accent/30">
            <CardHeader>
              <CardTitle className="font-['Outfit'] text-lg">Consejos para el Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Define el rol y personalidad de la IA (ej: "Eres un experto en...")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Especifica el idioma y tono de las respuestas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Incluye restricciones si es necesario (ej: "No respondas preguntas sobre...")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Sé claro y específico para obtener mejores resultados</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
