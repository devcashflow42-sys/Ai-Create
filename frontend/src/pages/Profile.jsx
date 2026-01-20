import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Calendar, Save } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/users/profile`, { name: name.trim() });
      updateUser(response.data);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al actualizar el perfil';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <h1 className="font-semibold font-['Outfit'] text-lg">Perfil</h1>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-10 h-10 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold font-['Outfit']" data-testid="profile-name">
                {user?.name}
              </h2>
              <p className="text-muted-foreground" data-testid="profile-masked-email">
                {user?.masked_email}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-['Outfit']">Editar Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 rounded-xl pl-10"
                      placeholder="Tu nombre"
                      data-testid="name-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={user?.masked_email || ''}
                      disabled
                      className="h-12 rounded-xl pl-10 bg-muted"
                      data-testid="email-display"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El correo electrónico no puede ser modificado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Miembro desde</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={formatDate(user?.created_at)}
                      disabled
                      className="h-12 rounded-xl pl-10 bg-muted"
                      data-testid="created-at-display"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full btn-hover"
                  disabled={loading}
                  data-testid="save-profile-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-['Outfit']">Información de la Cuenta</CardTitle>
              <CardDescription>
                Detalles de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">ID de Usuario</span>
                  <span className="font-mono text-sm" data-testid="user-id">{user?.id?.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="text-green-600 font-medium">Activo</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Prompt personalizado</span>
                  <span className="text-secondary font-medium">
                    {user?.system_prompt ? 'Configurado' : 'Por defecto'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
