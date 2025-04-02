import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';
import IMAGES from '@/assets/images/image';
import { Link } from 'react-router-dom';
import { ModeToggle } from './modeToggle';

const Navbar = () => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.fromTo(
      navRef.current,
      {
        y: -100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.3,
      }
    );
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
      gsap.fromTo(
        mobileMenuItems,
        {
          x: -20,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed w-screen z-50 transition-all duration-300  ${isScrolled ? 'bg-card ' : 'bg-transparent '}`}
    >
      <div ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-18 mt-2 mb-2 items-center">
          <div className="flex-shrink-0">
            <Link to="/home">
              <img
                className="h-14 w-auto mt-1 transition-transform duration-300 hover:scale-105"
                src={IMAGES.navBarLogoDark}
                alt="WorkSphere Logo"
              />
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            {['Home', 'Pricing', 'Contact', 'About'].map(item => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="menu-item text-lg text-foreground hover:text-primary  hover:scale-110 transition-colors duration-300 font-medium"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex space-x-4">
            <Link
              to="/login"
              className="menu-item bg-secondary/50  hover:bg-secondary/80 text-secondary-foreground font-semibold py-2 px-4 rounded transition-all duration-300  transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="menu-item bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <div className="menu-item bg-transparent">
              <ModeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 pt-2 pb-3 space-y-3 bg-card">
          {['Home', 'Pricing', 'Contact', 'About'].map(item => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="mobile-menu-item block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors duration-300"
            >
              {item}
            </Link>
          ))}
          <Link
            to="/login"
            className="mobile-menu-item block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="mobile-menu-item w-full block bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded transition-colors duration-300"
          >
            Get Started
          </Link>
          <div className="mobile-menu-item px-3 py-2">
            Color Theme <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;