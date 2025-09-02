import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import petsIcon from "@/assets/pets-icon.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={petsIcon} alt="PetCare" className="h-8 w-8" />
              <span className="text-xl font-bold">PetCare</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Conectando pets e cuidadores com amor e confiança. 
              Seu pet merece o melhor cuidado.
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer">
                <Facebook className="h-4 w-4" />
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer">
                <Instagram className="h-4 w-4" />
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer">
                <Twitter className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Serviços</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Pet Sitting</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Passeios</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Cuidados Especiais</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Emergências</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Como Funciona</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Seja Cuidador</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-background/80">contato@petcare.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-background/80">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-background/80">São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-background/80">
              <span>© 2024 PetCare. Feito com</span>
              <Heart className="h-4 w-4 text-accent fill-current" />
              <span>para pets e seus donos.</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Termos
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;