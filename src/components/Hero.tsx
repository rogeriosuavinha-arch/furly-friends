import { Button } from "@/components/ui/button";
import { Star, MapPin, Shield } from "lucide-react";
import heroImage from "@/assets/hero-pets.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Pets felizes com seus cuidadores" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center text-white py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 border border-white/30">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Cuidadores Verificados</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Encontre o Cuidador
            <br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Perfeito
            </span>{" "}
            para seu Pet
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Conectamos você com cuidadores e passeadores profissionais na sua região. 
            Seu pet merece o melhor cuidado enquanto você está fora.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">500+</div>
              <div className="text-sm text-white/80">Cuidadores</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">2.5k+</div>
              <div className="text-sm text-white/80">Pets Cuidados</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-2xl md:text-3xl font-bold">4.9</span>
                <Star className="h-5 w-5 fill-current text-accent" />
              </div>
              <div className="text-sm text-white/80">Avaliação</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="secondary" size="lg" className="min-w-[200px]">
              <MapPin className="h-5 w-5 mr-2" />
              Encontrar Cuidador
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20">
              Ser Cuidador
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 text-center">
            <p className="text-sm text-white/70 mb-4">Mais de 1000 famílias confiam em nós</p>
            <div className="flex justify-center items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current text-accent" />
              ))}
              <span className="ml-2 text-sm text-white/80">4.9 de 5 estrelas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;