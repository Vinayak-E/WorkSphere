import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/LandingPage/Hero';
import HeroSecond from '../components/LandingPage/HeroSecond';
import Footer from '@/components/LandingPage/Footer';
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const headingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const includedFeatures = [
    'Attendance Management',
    'Employee Perfomance Management',
    'Video Conferencing',
    'Real Time Messaging',
  ];

  useEffect(() => {

    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
          },
        }
      );
    }


    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
        }
      );
    }


    if (pricingRef.current) {
      gsap.fromTo(
        pricingRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: pricingRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
    <Navbar />
    <Hero/>
    <HeroSecond/>
    <div className=" pb-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
    
          <div ref={pricingRef} className="mx-auto mt-16 max-w-2xl rounded-3xl bg-card shadow-xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Easily organize your work. Start free.
              </h3>
              <p className="mt-6 text-base leading-7 text-card-foreground">
                Manage employee data, track leaves & attendance and automate payroll with the best HR & Payroll management software.
              </p>
              
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-foreground">
                  What's included
                </h4>
                <div className="h-px flex-auto bg-background" />
              </div>
              
              <ul ref={featuresRef} role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-card-foreground sm:grid-cols-2 sm:gap-6">
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-center">
                    <CheckIcon className="h-6 w-5 flex-none text-[#27AE60]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-secondary/6 py-10 text-center ring-1 ring-inset ring-[#D1D1D1] lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-foreground">
                    Just pay
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-foreground">4999</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-[#6C7A89]">RS</span>
                  </p>
                  <button className="mt-10 block w-full rounded-md bg-[#4A90E2] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#3D7EBD] transition-colors duration-300 transform hover:scale-105">
                    Get access for one year
                  </button>
                  <p className="mt-6 text-xs leading-5 text-[#6C7A89]">
                    Invoices and receipts available for easy company reimbursement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="w-full bg-primary/50 py-12 mb-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Badge Text */}
          <div className="text-center mb-10 ">
            <p className="text-4xl text-card-foreground font-semibold">
            See all that you can accomplish in WorkSphere 
            </p>
            <Link  to= '/register' className="mt-8 rounded-xl bg-primary hover:bg-primary/90 inline-flex items-center justify-center border border-primary text-primary-foreground font-semibold px-6 py-3  transition  hover:text-primary-foreground mr-3">
            Get Started
           
          </Link>
          <Link  to= '/register' className="mt-8 rounded-xl inline-flex items-center justify-center border border-primary-foreground bg-card px-6 py-3 text-primary font-medium transition hover:border-secondary hover:text-secondary">
             Find Your Subscription
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="ml-2 h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12H3.75m13.5 0l-4.5-4.5m4.5 4.5l-4.5 4.5" />
            </svg>
          </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Home;