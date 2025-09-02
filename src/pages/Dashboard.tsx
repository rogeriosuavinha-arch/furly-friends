import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, getProfile, getUserPets, signOut, type Profile, type Pet } from "@/lib/supabase";
import { Plus, PawPrint, Calendar, MessageCircle, Star, LogOut, Settings } from "lucide-react";
import Header from "@/components/Header";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: currentUser, error: authError } = await getCurrentUser();
      
      if (authError || !currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      // Load profile
      const { data: profileData, error: profileError } = await getProfile(currentUser.id);
      if (profileError) {
        console.error("Error loading profile:", profileError);
      } else {
        setProfile(profileData);
      }

      // Load pets
      const { data: petsData, error: petsError } = await getUserPets(currentUser.id);
      if (petsError) {
        console.error("Error loading pets:", petsError);
      } else {
        setPets(petsData || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <div className="container py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Olá, {profile?.full_name || "Usuário"}! 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel do PetCare
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meus Pets</p>
                  <p className="text-2xl font-bold">{pets.length}</p>
                </div>
                <PawPrint className="h-8 w-8 text-pet-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Calendar className="h-8 w-8 text-pet-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mensagens</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <MessageCircle className="h-8 w-8 text-pet-orange" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avaliações</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Star className="h-8 w-8 text-pet-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pets">Meus Pets</TabsTrigger>
            <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="pets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Meus Pets</h2>
              <Button variant="pet">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pet
              </Button>
            </div>

            {pets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <PawPrint className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum pet cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione seu primeiro pet para começar a usar o PetCare
                  </p>
                  <Button variant="pet">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Pet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <Card key={pet.id} className="hover:shadow-medium transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PawPrint className="h-5 w-5 text-pet-blue" />
                        <span>{pet.name}</span>
                      </CardTitle>
                      <CardDescription>
                        {pet.breed} • {pet.pet_type} • {pet.age} anos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Tamanho:</strong> {pet.size}</p>
                        <p><strong>Peso:</strong> {pet.weight}kg</p>
                        {pet.description && (
                          <p><strong>Descrição:</strong> {pet.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="pet" size="sm" className="flex-1">
                          Encontrar Cuidador
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
                <CardDescription>
                  Visualize e gerencie seus agendamentos de serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum agendamento</h3>
                  <p className="text-muted-foreground">
                    Você ainda não tem agendamentos. Procure um cuidador para seus pets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens</CardTitle>
                <CardDescription>
                  Converse com cuidadores e outros usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem</h3>
                  <p className="text-muted-foreground">
                    Suas conversas aparecerão aqui quando você começar a interagir com cuidadores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {profile?.full_name}</p>
                    <p><strong>Email:</strong> {profile?.email}</p>
                    <p><strong>Telefone:</strong> {profile?.phone || "Não informado"}</p>
                    <p><strong>Tipo de usuário:</strong> {profile?.user_type}</p>
                  </div>
                </div>
                <Button variant="outline">
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;