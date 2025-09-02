import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, Calendar, Heart } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <Search className="h-8 w-8 text-pet-blue" />,
      title: "Encontre Cuidadores",
      description: "Busque cuidadores verificados na sua região usando nossa plataforma intuitiva."
    },
    {
      number: "02",
      icon: <UserCheck className="h-8 w-8 text-pet-green" />,
      title: "Conheça o Perfil",
      description: "Veja avaliações, experiência e especialidades de cada cuidador antes de escolher."
    },
    {
      number: "03",
      icon: <Calendar className="h-8 w-8 text-pet-orange" />,
      title: "Agende o Serviço",
      description: "Escolha datas, horários e configure os cuidados específicos do seu pet."
    },
    {
      number: "04",
      icon: <Heart className="h-8 w-8 text-pet-purple" />,
      title: "Relaxe e Acompanhe",
      description: "Receba fotos e atualizações em tempo real sobre o seu pet."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples, encontre o cuidador ideal para seu pet
            e tenha tranquilidade total.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="relative group hover:shadow-medium transition-all duration-300 bg-gradient-card border-0">
              <CardContent className="p-6 text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 mt-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="lg" className="min-w-[250px]">
            Começar Agora
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Cadastro gratuito • Sem taxas de inscrição
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;