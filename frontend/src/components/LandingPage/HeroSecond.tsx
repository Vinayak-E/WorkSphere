import { Clock, Calendar, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import IMAGES from "@/assets/images/image";

const HeroSecond = () => {
  return (
    <div className="w-full bg-background min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simplify{" "}
            <span className="text-blue-400"> Time and Attendance </span>Tracking
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Easily Manage all your Employees' Attendance, Approvals and
            Regularization Workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <Card className="p-6 bg-card/50 backdrop-blur rounded-3xl border border-border/50 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground text-center">
                Attendance Log
              </h3>
            </div>
            <div className="mt-auto bg-card p-4">
              <div className="h-auto bg-transparent rounded-lg flex items-center justify-center">
                <img
                  src={IMAGES.heroSecond1}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur rounded-3xl border border-border/50 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground text-center mb-2">
                Apply for Leave
              </h3>
            </div>
            <div className="mt-auto bg-card p-4">
              <div className="h-auto bg-transparent rounded-lg flex items-center justify-center">
                <img
                  src={IMAGES.heroSecond3}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur rounded-3xl border border-border/50 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground text-center">
                Accessible on Mobile
              </h3>
            </div>
            <div className="mt-auto bg-card p-4">
              <div className="h-auto bg-transparent rounded-lg flex items-center justify-center">
                <img
                  src={IMAGES.heroSecond2}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroSecond;
