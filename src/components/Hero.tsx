
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-gradient-header text-white py-16 px-4 text-center">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome To Food Court</h1>
        <p className="text-xl mb-8">Discover and Order the dish and taste it</p>
        <Link to="/#menu">
          <Button className="bg-white text-foodcourt-red hover:bg-gray-100 font-semibold text-base">
            Explore Menu
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
