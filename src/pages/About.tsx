
import MainLayout from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { Film, FileText, Users, Heart } from 'lucide-react';

const About = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">About ScreenPick</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              ScreenPick was created to solve the "what should we watch tonight?" dilemma.
              Instead of endlessly scrolling through streaming apps, we help you find the perfect movie or show
              based on your mood and preferences.
            </p>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">How It Works</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Film className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">Smart Recommendations</h3>
                </div>
                <p className="text-muted-foreground">
                  Our algorithm takes your mood and preferences into account to suggest films and shows
                  you're likely to enjoy, cutting through the endless options.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">Detailed Information</h3>
                </div>
                <p className="text-muted-foreground">
                  Each recommendation includes comprehensive details, trailers, ratings, and more to
                  help you decide if it's right for you.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">Our Vision</h2>
            
            <p className="text-muted-foreground mb-6">
              We believe that great stories bring people together. Our goal is to help you spend less time
              searching and more time enjoying amazing content that matches your preferences.
            </p>
            
            <div className="bg-theme-light-gray rounded-lg p-8 my-10">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-theme-accent-blue mr-3" />
                <h3 className="text-xl font-medium">Join Our Community</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Love movies and TV shows? Join our growing community of entertainment enthusiasts.
                Share recommendations, discuss your favorites, and discover new content together.
              </p>
              <Link to="/discover" className="button-primary inline-flex">
                Start Discovering
              </Link>
            </div>
            
            <h2 className="text-2xl font-medium mt-10 mb-6">The TMDB API</h2>
            
            <p className="text-muted-foreground mb-6">
              ScreenPick is powered by the TMDB (The Movie Database) API, which provides access to a vast 
              collection of movies and TV shows. This allows us to offer comprehensive information and 
              high-quality images for all our recommendations.
            </p>
            
            <div className="flex items-center justify-center my-10">
              <div className="flex items-center text-muted-foreground">
                <Heart className="w-5 h-5 text-theme-accent-red mr-2" />
                <span>Made with love for movie fans everywhere</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
