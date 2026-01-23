import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { 
  ArrowLeft, User, Key, CreditCard, Moon, Sun, Camera, Save, 
  Plus, Trash2, Copy, Eye, EyeOff, AlertTriangle, Check, Zap
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLANS = {
  promocion: { name: "Plan Promoción", price: 250, credits: 50000, description: "Ideal para empezar" },
  estandar: { name: "Plan Estándar", price: 400, credits: 100000, description: "Para uso regular" },
  premium: { name: "Plan Premium", price: 500, credits: 200000, description: "Uso ilimitado profesional" }
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showKeyCreatedDialog, setShowKeyCreatedDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);
  
  // Usage state
  const [credits, setCredits] = useState(user?.credits || 0);
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free');

  useEffect(() => {
    fetchApiKeys();
    fetchUsage();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get(`${API_URL}/api-keys`);
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await axios.get(`${API_URL}/usage`);
      setCredits(response.data.credits);
      setCurrentPlan(response.data.plan);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        toast.error('La imagen debe ser menor a 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    setProfileLoading(true);
    try {
      const updateData = { name: name.trim() };
      if (profileImage !== user?.profile_image) {
        updateData.profile_image = profileImage;
      }
      const response = await axios.put(`${API_URL}/users/profile`, updateData);
      updateUser(response.data);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Ingresa un nombre para la API Key');
      return;
    }
    setKeyLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api-keys`, { name: newKeyName.trim() });
      setCreatedKey(response.data);
      setShowNewKeyDialog(false);
      setShowKeyCreatedDialog(true);
      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      toast.error('Error al crear API Key');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('¿Eliminar esta API Key?')) return;
    try {
      await axios.delete(`${API_URL}/api-keys/${keyId}`);
      toast.success('API Key eliminada');
      fetchApiKeys();
    } catch (error) {
      toast.error('Error al eliminar API Key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handlePurchasePlan = async (planId) => {
    try {
      const response = await axios.post(`${API_URL}/plans/purchase`, { plan_id: planId });
      toast.success(response.data.message);
      setCredits(response.data.credits);
      setCurrentPlan(planId);
      updateUser({ ...user, credits: response.data.credits, plan: planId });
    } catch (error) {
      toast.error('Error al procesar el pago');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 glass sticky top-0 z-10">
        <Button variant="ghost" onClick={() => navigate('/chat')} className="mr-4" data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="font-semibold font-['Outfit'] text-lg">Ajustes</h1>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Planes
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Outfit']">Perfil</CardTitle>
                  <CardDescription>Administra tu información personal</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                          {profileImage ? (
                            <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-secondary-foreground" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:scale-110 transition-transform"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.masked_email || ''} disabled className="h-12 rounded-xl bg-muted" />
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-full" disabled={profileLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Outfit']">Apariencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span>Modo Oscuro</span>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* API KEYS TAB */}
          <TabsContent value="api-keys">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-['Outfit']">API Keys</CardTitle>
                    <CardDescription>Gestiona tus llaves de acceso a Brainyx API</CardDescription>
                  </div>
                  <Button onClick={() => setShowNewKeyDialog(true)} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" /> Nueva API Key
                  </Button>
                </CardHeader>
                <CardContent>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tienes API Keys. Crea una para empezar.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{key.key_preview}</p>
                            <p className="text-xs text-muted-foreground">
                              Creada: {new Date(key.created_at).toLocaleDateString('es-ES')}
                              {key.last_used && ` • Último uso: ${new Date(key.last_used).toLocaleDateString('es-ES')}`}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteApiKey(key.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Outfit']">Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Créditos disponibles</p>
                      <p className="text-3xl font-bold">{credits.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* PLANS TAB */}
          <TabsContent value="plans">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Outfit']">Planes y Pagos</CardTitle>
                  <CardDescription>Elige el plan que mejor se adapte a ti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(PLANS).map(([id, plan]) => (
                      <div 
                        key={id} 
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          currentPlan === id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <h3 className="text-xl font-semibold font-['Outfit']">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        <p className="text-3xl font-bold mt-4">${plan.price} <span className="text-sm font-normal">USD</span></p>
                        <p className="text-sm text-muted-foreground mt-1">{plan.credits.toLocaleString()} créditos</p>
                        <Button 
                          onClick={() => handlePurchasePlan(id)} 
                          className={`w-full mt-4 rounded-full ${currentPlan === id ? 'bg-green-600' : ''}`}
                          disabled={currentPlan === id}
                        >
                          {currentPlan === id ? <><Check className="w-4 h-4 mr-2" /> Activo</> : 'Comprar'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* New API Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva API Key</DialogTitle>
            <DialogDescription>Ingresa un nombre para identificar esta llave.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Nombre de la API Key" 
              value={newKeyName} 
              onChange={(e) => setNewKeyName(e.target.value)} 
              className="h-12 rounded-xl"
            />
            <Button onClick={handleCreateApiKey} className="w-full h-12 rounded-full" disabled={keyLoading}>
              {keyLoading ? 'Creando...' : 'Crear API Key'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Created Dialog */}
      <Dialog open={showKeyCreatedDialog} onOpenChange={setShowKeyCreatedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ No compartas esta llave con nadie
            </DialogTitle>
            <DialogDescription>Esta es tu API Key. Solo se muestra una vez. Guárdala en un lugar seguro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl font-mono text-sm break-all">
              {createdKey?.key}
            </div>
            <Button onClick={() => copyToClipboard(createdKey?.key)} className="w-full h-12 rounded-full">
              <Copy className="w-4 h-4 mr-2" /> Copiar API Key
            </Button>
            <Button variant="outline" onClick={() => setShowKeyCreatedDialog(false)} className="w-full h-12 rounded-full">
              Entendido, la guardé
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
