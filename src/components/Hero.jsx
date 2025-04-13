import React from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "../assets/hero-bg.gif";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section 
      id="home" 
      className="relative bg-cover bg-center h-screen" 
      style={{ 
        backgroundImage: `url(${heroBackground})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-40 flex h-full items-center justify-center text-center text-white px-6">
        <div className="z-40 max-w-[800px]">
          <h1 className="mb-4 text-3xl font-extrabold capitalize leading-[1.2] md:text-5xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
              Meal Prep & Recipe App
            </span>
          </h1>
          <p className="mb-6 text-lg md:text-xl">
            Discover and manage your meals with ease. Explore thousands of recipes, create meal plans, and stay healthy!
          </p>
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 inline-block capitalize font-semibold bg-gradient-to-r from-green-400 to-teal-600 text-white rounded-md transition duration-300 hover:scale-105 hover:shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
