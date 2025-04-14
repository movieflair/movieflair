
import { useState } from 'react';
import { ChevronRight, Film, Smile, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-theme-light-gray">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Find your next <span className="text-theme-accent-blue">perfect watch</span> in seconds
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Don't know what to watch? Tell us your mood, and we'll recommend the perfect movie or show.
            </p>
            <Link to="/discover" className="button-primary text-lg px-8 py-3">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ScreenPick helps you cut through the endless scrolling and find something you'll love to watch.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smile className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Choose Your Mood</h3>
              <p className="text-muted-foreground">
                Select up to 3 moods, genres, or themes that match what you're feeling right now.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Apply Filters</h3>
              <p className="text-muted-foreground">
                Refine your search with additional options like decade, rating, or streaming service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Get Recommendations</h3>
              <p className="text-muted-foreground">
                We'll suggest the perfect movie or show based on your preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-theme-accent-dark text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">
              Ready to find your next favorite movie or show?
            </h2>
            <p className="text-lg opacity-80 mb-8">
              Stop scrolling through endless options. Let us help you discover something you'll love.
            </p>
            <Link to="/discover" className="inline-flex items-center bg-white text-theme-accent-dark px-8 py-3 rounded-full font-medium transition-all hover:bg-white/90">
              Start Discovering
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
