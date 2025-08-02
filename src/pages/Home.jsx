import React from "react";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/AboutUs";
import WhyUs from "../components/WhyUs";
import CustomerExperience from "../components/CustomerExperience";
import Partners from "../components/Partners";

const Home = () => {
  return (
    <>
      <HeroSection />
      <AboutUs />
      <WhyUs />
      <CustomerExperience />
      <Partners />
    </>
  );
};

export default Home;
