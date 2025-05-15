import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import IMAGES from '@/assets/images/image';
import { Link } from 'react-router-dom';

const Hero = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      [titleRef.current, subtitleRef.current],
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
      }
    );

    const img = new Image();
    img.src = IMAGES.man;
    img.onload = () => {
      setImageLoaded(true);
      gsap.fromTo(
        imageRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
        }
      );
    };

    return () => {
      img.onload = null;
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-tr from-primary/10 to-primary/30">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 pb-20">
            <div className="pt-10 lg:pt-20 flex flex-col justify-center">
              <h1
                ref={titleRef}
                className="text-2xl sm:text-5xl lg:text-5xl font-bold text-foreground lg:leading-tight mb-6"
              >
                Inspire your team with WorkSphere and Automate workflows across
                departments
              </h1>
              <p
                ref={subtitleRef}
                className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl"
              >
                Transform Workforce Data into Actionable Results
              </p>
              <div>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl inline-block"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <div
              ref={imageRef}
              className="relative lg:h-96 mt-8 lg:mt-10 pt-10 md:h-96 sm:h-96"
            >
              <div className="relative w-full h-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 rounded-md z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-md z-10" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent rounded-md z-10 transition-opacity duration-300" />
                
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-blue-200 animate-pulse rounded-xl" />
                )}
                
                <img
                  src={IMAGES.manNew}
                  alt="Dashboard Analytics"
                  loading="lazy"
                  className={`object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xl text-card-foreground font-medium">
              Your people, projects and tasks, all on the world's most beloved
              work operating system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;