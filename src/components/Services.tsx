import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Home, Calendar, Camera, Shield, Clock } from "lucide-react";
import petWalkerImg from "@/assets/pet-walker.png";
import petSitterImg from "@/assets/pet-sitter.png";

const Services = () => {
  const services = [
    {
      icon: <Home className="h-8 w-8 text-pet-blue" />,
      title: "Pet Sitting",
      description: "Cuidado personalizado na sua casa. Seu pet fica confortável no ambiente familiar.",
      image: petSitterImg,
      features: ["Cuidado em casa", "Rotina personalizada", "Relatórios diários"]
    },
    {
      icon: <Calendar className="h-8 w-8 text-pet-green" />,
      title: "Passeios",
      description: "Passeios regulares e exercícios para manter seu pet ativo e feliz.",
      image: petWalkerImg,
      features: ["Exercício regular", "Socialização", "Flexível horários"]
    },
    {
      icon: <Heart className="h-8 w-8 text-pet-orange" />,
      title: "Cuidados Especiais",
      description: "Administração de medicamentos e cuidados veterinários especializados.",
      image: petSitterImg,
      features: ["Medicamentos", "Cuidados médicos", "Pets idosos"]
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Cuidadores Verificados",
      description: "Todos os cuidadores passam por verificação de antecedentes e treinamento."
    },
    {
      icon: <Camera className="h-6 w-6 text-secondary" />,
      title: "Fotos e Relatórios",
      description: "Receba fotos e relatórios diários sobre as atividades do seu pet."
    },
    {
      icon: <Clock className="h-6 w-6 text-accent" />,
      title: "Disponível 24/7",
      description: "Suporte disponível a qualquer hora para emergências."
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Nossos Serviços
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos uma variedade de serviços profissionais para garantir 
            que seu pet receba o melhor cuidado possível.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-muted-foreground">
                  {service.description}
                </p>
                <ul className="space-y-2 text-sm">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="pet" className="w-full mt-4">
                  Solicitar Serviço
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-accent flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;