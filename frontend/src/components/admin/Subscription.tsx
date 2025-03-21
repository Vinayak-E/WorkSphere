import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  createSubscription, 
  fetchSubscriptions, 
  updateSubscription 
} from "@/services/admin/subscription.service";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Edit, Trash, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 6;
interface SubscriptionPlan {
  _id?: string;
  planName: string;
  description: string;
  price: number;
  durationInMonths: number;
  planType: "Trial" | "Basic" | "Premium"; 
  features: string[];
  employeeCount: number | null;
  projectCount: number | null;
  isActive: boolean;
}
const SubscriptionAdmin = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] =useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SubscriptionPlan>({
    planName: "", 
    description: "", 
    price: 0, 
    durationInMonths: 1, 
    planType: "Basic",
    features: [],
    employeeCount: null,
    projectCount: null,
    isActive: true
  });
  const [featureInput, setFeatureInput] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    let filtered = plans.filter(plan =>
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (activeTab !== "all") {
      filtered = filtered.filter(plan => plan.planType.toLowerCase() === activeTab.toLowerCase());
    }
    
    setFilteredPlans(filtered);
    setCurrentPage(1);
  }, [searchQuery, plans, activeTab]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubscriptions();
      console.log("data",data)
      setPlans(data.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateSubscription(editId, formData);
      } else {
        await createSubscription(formData);
      }
      setModalOpen(false);
      loadSubscriptions();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };



  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData, 
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index:number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({...formData, features: updatedFeatures});
  };

  const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const planTypeColorMap = {
    "Trial": "bg-yellow-100 text-yellow-800",
    "Basic": "bg-blue-100 text-blue-800",
    "Premium": "bg-purple-100 text-purple-800"
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Subscription Plans
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manage and configure available subscription plans
              </p>
            </div>
            <Button onClick={() => { 
              setFormData({ 
                planName: "", 
                description: "", 
                price: 0, 
                durationInMonths: 1, 
                planType: "Basic",
                features: [],
                employeeCount: null,
                projectCount: null,
                isActive: true
              });
              setEditId(null);
              setModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Plan
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trial">Trial</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {paginatedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPlans.map((plan) => (
                <Card key={plan._id} className={`overflow-hidden transition-all duration-200 hover:shadow-md ${!plan.isActive ? 'opacity-60' : ''}`}>
                  <div className={`h-2 w-full ${plan.planType === "Premium" ? "bg-purple-500" : plan.planType === "Trial" ? "bg-yellow-500" : "bg-blue-500"}`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={`mb-2 ${planTypeColorMap[plan.planType] || "bg-gray-100 text-gray-800"}`}>
                          {plan.planType}
                        </Badge>
                        <CardTitle className="text-xl">{plan.planName}</CardTitle>
                      </div>
                      <div className="text-2xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.durationInMonths === 1 ? 'month' : `${plan.durationInMonths} months`}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    
                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Features:</p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
  <div className="bg-gray-50 p-2 rounded">
    <span className="font-medium">Employees: </span>
    {plan.employeeCount ?? 'Unlimited'}
  </div>
  <div className="bg-gray-50 p-2 rounded">
    <span className="font-medium">Projects: </span>
    {plan.projectCount ?? 'Unlimited'}
  </div>
</div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setFormData(plan);
                        setEditId(plan._id ?? null);
                        setModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                   
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium text-gray-600">No subscription plans found</p>
              <p className="text-muted-foreground">Try adjusting your search or create a new plan</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPlans.length)}{" "}
                of {filteredPlans.length} plans
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Subscription Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input 
                  id="planName"
                  placeholder="Premium Plan" 
                  value={formData.planName}
                  onChange={(e) => setFormData({...formData, planName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <select
                  id="planType"
                  value={formData.planType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      planType: e.target.value as SubscriptionPlan["planType"],
                    })}    
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Trial">Trial</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Plan description..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price"
                  type="number" 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input 
                  id="duration"
                  type="number" 
                  min="1"
                  value={formData.durationInMonths}
                  onChange={(e) => setFormData({...formData, durationInMonths: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count (Optional)</Label>
                <Input 
                  id="employeeCount"
                  type="number" 
                  min="0"
                  placeholder="Unlimited if blank"
                  value={formData.employeeCount === null ? "" : formData.employeeCount}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : Number(e.target.value);
                    setFormData({...formData, employeeCount: value});
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectCount">Project Count (Optional)</Label>
                <Input 
                  id="projectCount"
                  type="number" 
                  min="0"
                  placeholder="Unlimited if blank"
                  value={formData.projectCount === null ? "" : formData.projectCount}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : Number(e.target.value);
                    setFormData({...formData, projectCount: value});
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a feature..." 
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  Add
                </Button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-md">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>{feature}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="isActive">Plan Active</Label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editId ? "Save Changes" : "Create Plan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionAdmin;