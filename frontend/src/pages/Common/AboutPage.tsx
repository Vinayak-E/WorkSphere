import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import IMAGES from '@/assets/images/image';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.fromTo(
      pageRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    );

    const elements = document.querySelectorAll('.animate-in');
    gsap.fromTo(
      elements,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
    );
  }, []);

  return (
    <div ref={pageRef} className="bg-background min-h-screen">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-sm z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src={IMAGES.navBarLogoDark}
                alt="WorkSphere Logo"
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/80 to-primary py-16 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-primary-foreground animate-in">About WorkSphere</h1>
          <p className="mt-2 text-lg text-primary-foreground/90 animate-in">
            Transforming how companies manage work and teams.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* Our Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="animate-in">
            <h2 className="text-3xl font-semibold text-foreground mb-6">Our Story</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-4">
                Founded in 2025, WorkSphere began with a simple mission: to create a work management platform that actually works for people, not against them.
              </p>
              <p className="text-muted-foreground mb-4">
                Our founders, experienced product managers and engineers, were frustrated with fragmented tools that created more work rather than simplifying it. They envisioned a unified platform where teams could collaborate seamlessly, track progress effortlessly, and focus on meaningful work.
              </p>
              <p className="text-muted-foreground">
                Today, WorkSphere serves thousands of businesses worldwide, from startups to Fortune 500 companies, all unified by the desire to work smarter, not harder.
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border animate-in">
            <img
              src={IMAGES.teamImage}
              alt="WorkSphere Team"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-medium text-foreground mb-2">From Vision to Reality</h3>
              <p className="text-muted-foreground">
                Our team has grown from 5 passionate founders to over 200 dedicated professionals across the globe, all committed to transforming how work gets done.
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Values Section */}
        <div className="mb-16 animate-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Our Mission & Values</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              At WorkSphere, we're driven by core principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">Efficiency First</h3>
              <p className="text-muted-foreground">
                We believe in maximizing productivity by eliminating busywork and streamlining workflows.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">People-Centered</h3>
              <p className="text-muted-foreground">
                We design for humans first, creating intuitive experiences that empower rather than overwhelm.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">Security & Trust</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards of data security and privacy, earning our customers' trust every day.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-16 animate-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Our Platform</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              WorkSphere brings together everything teams need to plan, track, and deliver their best work.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border flex flex-col">
              <img
                src={IMAGES.projectManagement}
                alt="Project Management"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex-1">
                <h3 className="text-xl font-medium text-foreground mb-2">Comprehensive Project Management</h3>
                <p className="text-muted-foreground mb-4">
                  From task tracking to timeline visualization, our platform provides powerful tools to keep projects on track and teams aligned.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kanban, list, and calendar views
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Automated workflows
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Time tracking and estimation
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border flex flex-col">
              <img
                src={IMAGES.teamCollaboration}
                alt="Team Collaboration"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex-1">
                <h3 className="text-xl font-medium text-foreground mb-2">Seamless Team Collaboration</h3>
                <p className="text-muted-foreground mb-4">
                  Break down silos with integrated communication and document sharing that keeps everyone in sync.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Real-time document collaboration
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Team messaging and commenting
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    File sharing and version control
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16 animate-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Leadership Team</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the people driving WorkSphere's mission forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Vinayak E",
                role: "Chief Executive Officer",
                bio: "Former tech executive with 7+ years of experience building SaaS products.",
                imageKey: "Vinayak"
              },
              {
                name: "Michael Rodriguez",
                role: "Chief Technology Officer",
                bio: "Engineering leader with a background in building scalable enterprise solutions.",
                imageKey: "Michael"
              },
              {
                name: "Aisha Johnson",
                role: "Chief Product Officer",
                bio: "Product visionary focused on creating intuitive user experiences.",
                imageKey: "Aisha"
              },
              {
                name: "David Park",
                role: "Chief Operating Officer",
                bio: "Operations expert specializing in scaling high-growth tech companies.",
                imageKey: "David"
              }
            ].map((person, index) => (
              <div key={index} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <img
   src={IMAGES[person.imageKey as keyof typeof IMAGES]}
        alt={person.name}
        className="w-full h-64 object-cover"
      />
                <div className="p-6">
                  <h3 className="text-lg font-medium text-foreground">{person.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{person.role}</p>
                  <p className="text-muted-foreground text-sm">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16 animate-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Success stories from teams and organizations using WorkSphere.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "WorkSphere transformed how our distributed team collaborates. We've reduced meeting time by 30% while improving project delivery timelines.",
                author: "Emma Lawson",
                position: "Director of Operations, TechNova",
                imageKey: "Emma"
              },
              {
                quote: "The customizable workflows and automation features have saved our team countless hours on repetitive tasks. WorkSphere paid for itself within the first month.",
                author: "Marcus Bailey",
                position: "Project Manager, GrowthWorks",
                imageKey: "Marcus"
              },
              {
                quote: "As we scaled from 10 to 100 employees, WorkSphere scaled with us. The platform's flexibility allowed us to adapt our processes without missing a beat.",
                author: "Sophia Garcia",
                position: "CEO, LaunchPad Startup",
                imageKey: "Sophia"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-start mb-4">
                  <svg className="h-10 w-10 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-muted-foreground mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <img 
                    src={IMAGES[testimonial.imageKey as keyof typeof IMAGES]}  
                    alt={testimonial.author} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="text-foreground font-medium">{testimonial.author}</h4>
                    <p className="text-muted-foreground text-sm">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-xl p-8 shadow-sm border border-primary/10 animate-in">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Ready to transform how your team works?</h2>
              <p className="text-muted-foreground">
                Join thousands of teams that have improved productivity with WorkSphere.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="bg-background hover:bg-background/80 text-foreground border border-input font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;