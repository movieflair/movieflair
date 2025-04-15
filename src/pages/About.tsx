
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { Film, FileText, Users, Heart } from 'lucide-react';

const About = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">Über MovieFlair</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              MovieFlair ist mehr als nur eine Streaming-Empfehlungsplattform. 
              Wir sind Ihre persönliche Filmreise-Companion, der Ihnen hilft, 
              genau den richtigen Film oder die perfekte Serie für jeden Moment zu finden. 
              Unser KI-gestützter Algorithmus versteht nicht nur Ihre Vorlieben, 
              sondern auch Ihre Stimmung.
            </p>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">Unsere Mission</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Film className="w-5 h-5 text-[#ff3131]" />
                  </div>
                  <h3 className="text-xl font-medium">Personalisierte Entdeckungen</h3>
                </div>
                <p className="text-muted-foreground">
                  Tauchen Sie ein in eine Welt von Filmen und Serien, 
                  die genau auf Sie zugeschnitten sind. Keine Kompromisse, 
                  keine Zeitverschwendung - nur pure Unterhaltung.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-[#ff3131]" />
                  </div>
                  <h3 className="text-xl font-medium">Umfassende Informationen</h3>
                </div>
                <p className="text-muted-foreground">
                  Jede Empfehlung kommt mit detaillierten Informationen, 
                  Kritiken, Trailern und Hintergründen - damit Sie informiert 
                  und begeistert in Ihr nächstes Filmerlebnis starten.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">Unsere Vision</h2>
            
            <p className="text-muted-foreground mb-6">
              MovieFlair glaubt daran, dass Geschichten verbinden. 
              Wir wollen Ihre Reise durch die Welt der Filme und Serien 
              so einfach, persönlich und aufregend wie möglich gestalten.
            </p>
            
            <div className="bg-theme-light-gray rounded-lg p-8 my-10">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-[#ff3131] mr-3" />
                <h3 className="text-xl font-medium">Community & Teilen</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Werden Sie Teil unserer Community von Filmliebhabern. 
                Teilen Sie Ihre Empfehlungen, diskutieren Sie über Ihre Lieblinge 
                und entdecken Sie gemeinsam neue Geschichten.
              </p>
              <Link to="/entdecken" className="inline-flex items-center px-6 py-3 bg-[#ff3131] text-white rounded-lg hover:bg-[#ff3131]/90 transition-colors">
                Jetzt entdecken
              </Link>
            </div>
            
            <div className="flex items-center justify-center my-10">
              <div className="flex items-center text-muted-foreground">
                <Heart className="w-5 h-5 text-[#ff3131] mr-2" />
                <span>Mit Leidenschaft entwickelt für Filmfans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
