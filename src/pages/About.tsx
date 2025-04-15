
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
              MovieFlair wurde mit einem klaren Ziel entwickelt: Die ewige Frage "Was schauen wir heute?" 
              zu beantworten. Statt endlosen Scrollens durch Streaming-Dienste helfen wir dir dabei, 
              den perfekten Film oder die perfekte Serie zu finden, die genau zu deiner aktuellen 
              Stimmung und deinen Vorlieben passt.
            </p>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">So funktioniert's</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Film className="w-5 h-5 text-[#ff3131]" />
                  </div>
                  <h3 className="text-xl font-medium">Smarte Empfehlungen</h3>
                </div>
                <p className="text-muted-foreground">
                  Unser Algorithmus berücksichtigt deine Stimmung und Vorlieben, um dir Filme und Serien 
                  vorzuschlagen, die dir wirklich gefallen werden.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-[#ff3131]" />
                  </div>
                  <h3 className="text-xl font-medium">Detaillierte Informationen</h3>
                </div>
                <p className="text-muted-foreground">
                  Zu jeder Empfehlung findest du umfassende Details, Trailer, Bewertungen und mehr, 
                  damit du die perfekte Entscheidung treffen kannst.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">Unsere Vision</h2>
            
            <p className="text-muted-foreground mb-6">
              Wir glauben daran, dass großartige Geschichten Menschen zusammenbringen. Unser Ziel ist es, 
              dir zu helfen, weniger Zeit mit der Suche und mehr Zeit damit zu verbringen, 
              fantastische Unterhaltung zu genießen, die perfekt zu dir passt.
            </p>
            
            <div className="bg-theme-light-gray rounded-lg p-8 my-10">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-[#ff3131] mr-3" />
                <h3 className="text-xl font-medium">Werde Teil unserer Community</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Du liebst Filme und Serien? Dann werde Teil unserer wachsenden Community von 
                Entertainmentbegeisterten. Teile Empfehlungen, diskutiere über deine Favoriten 
                und entdecke gemeinsam neue Inhalte.
              </p>
              <Link to="/entdecken" className="inline-flex items-center px-6 py-3 bg-[#ff3131] text-white rounded-lg hover:bg-[#ff3131]/90 transition-colors">
                Jetzt entdecken
              </Link>
            </div>
            
            <div className="flex items-center justify-center my-10">
              <div className="flex items-center text-muted-foreground">
                <Heart className="w-5 h-5 text-[#ff3131] mr-2" />
                <span>Mit Liebe entwickelt für Filmfans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
