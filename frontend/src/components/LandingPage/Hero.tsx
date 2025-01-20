import IMAGES from '@/assets/images/image';

 const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden pt-4">
      {/* Main Hero Section */}
      <div className="relative bg-gradient-to-r from-background to-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 pb-20">
            {/* Left Content */}
            <div className="pt-10 lg:pt-20 flex flex-col justify-center">
              <h1 className="text-2xl sm:text-5xl lg:text-5xl font-bold text-foreground lg:leading-tight mb-6">
                Inspire your team with WorkSphere and Automate workflows across departments
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
                Manage and build a high performing tech team with an HCM platform
              </p>
              
              <div>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                 Get Started
                </button>
              </div>
            </div>

            <div className="relative lg:h-[400px] mt-8 lg:mt-10 pt-10 md:h-[400px] sm:h-[400px]">
              <img 
                src={IMAGES.hero} 
                alt="Dashboard Analytics"
                className="object-cover w-full h-full rounded-3xl shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Showcase Section */}
      <div className="w-full bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Badge Text */}
          <div className="text-center mb-10">
            <p className="text-xl text-card-foreground font-medium">
            Your people, projects and tasks, all on the world's most beloved work operating system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;