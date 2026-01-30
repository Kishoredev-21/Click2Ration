import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  MapPin,
  Fingerprint,
  Phone,
  Download,
  Home
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrackingPageProps {
  onReturnHome: () => void;
}

const TrackingPage = ({ onReturnHome }: TrackingPageProps) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(2);
  const [deliveryProgress, setDeliveryProgress] = useState(75);
  
  const orderSteps = [
    {
      id: "confirmed",
      title: t("tracking.orderConfirmed"),
      description: t("tracking.orderConfirmedDesc"),
      time: "12:30 PM",
      completed: true,
      icon: CheckCircle
    },
    {
      id: "prepared",
      title: t("tracking.itemsPrepared"),
      description: t("tracking.itemsPreparedDesc"),
      time: "1:15 PM",
      completed: true,
      icon: Package
    },
    {
      id: "dispatched",
      title: t("tracking.outForDelivery"),
      description: t("tracking.outForDeliveryDesc"),
      time: "2:00 PM",
      completed: true,
      icon: Truck
    },
    {
      id: "delivered",
      title: t("tracking.biometricVerification"),
      description: t("tracking.biometricDesc"),
      time: `${t("tracking.expected")} 3:30 PM`,
      completed: false,
      icon: Fingerprint
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryProgress(prev => {
        if (prev >= 100) {
          setCurrentStep(3);
          return 100;
        }
        return Math.min(prev + 2, 95);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const completedSteps = currentStep + 1;
  const overallProgress = (completedSteps / orderSteps.length) * 100;

  const downloadReceipt = () => {
    const receiptContent = `
Tamil Nadu Click2Ration - Order Receipt
=====================================
Order ID: #TR2024${Math.floor(Math.random() * 10000)}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Items Ordered:
- Rice (2kg): ₹50
- Wheat (2kg): ₹60
- Dhal (1kg): ₹80
- Palm Oil (1L): ₹120
- Sugar (1kg): ₹45

Subtotal: ₹355
Delivery Charge: ₹10
Total Amount: ₹365

Delivery Address: 123, Main Street, Chennai
Payment Method: UPI
Status: Delivered

Thank you for using Click2Ration!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ration-receipt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("tracking.title")}</h1>
            <p className="text-muted-foreground">{t("tracking.description")}</p>
            
            <div className="mt-4">
              <Badge variant="outline" className="bg-success/10 text-success border-success text-lg px-4 py-2">
                {t("tracking.order")} #RH240113001
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("tracking.deliveryProgress")}</CardTitle>
                <CardDescription>
                  {deliveryProgress < 100 ? t("tracking.onTheWay") : t("tracking.readyForDelivery")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t("tracking.overallProgress")}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
                
                <div className="space-y-4">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep || step.completed;
                    
                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                          isActive 
                            ? "bg-primary/10 border-primary" 
                            : isCompleted 
                            ? "bg-success/5 border-success/20" 
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          isCompleted 
                            ? "bg-success text-success-foreground" 
                            : isActive 
                            ? "bg-primary text-primary-foreground animate-pulse" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${
                              isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                            }`}>
                              {step.title}
                            </h3>
                            <span className="text-sm text-muted-foreground">{step.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          
                          {isActive && step.id === "dispatched" && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>{t("tracking.enRoute")}</span>
                                <span>{deliveryProgress}%</span>
                              </div>
                              <Progress value={deliveryProgress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t("tracking.liveLocation")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Truck className="w-12 h-12 mx-auto mb-2 text-primary animate-bounce" />
                    <p className="font-medium">{t("tracking.vehicleLocation")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("tracking.approximately")} 2.3 km {t("tracking.away")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("tracking.eta")} 15-20 {t("tracking.minutes")}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-accent" />
                    <span className="font-medium">{t("tracking.deliveryAgent")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Murugan S. - {t("tracking.vehicle")}: TN 09 AB 1234<br />
                    {t("tracking.contact")}: +91 98765 43210
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t("tracking.orderDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("product.rice")}</span>
                    <span>5 kg - ₹15.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("product.oil")}</span>
                    <span>1 L - ₹25.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("product.dhal")}</span>
                    <span>1 kg - ₹60.00</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{t("tracking.totalPaid")}</span>
                    <span className="text-secondary">₹100.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("tracking.paymentMethod")} UPI
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Fingerprint className="w-5 h-5" />
                  {t("tracking.biometricSecurity")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("tracking.secureDelivery")}
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>{t("tracking.preventsUnauthorized")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>{t("tracking.ensuresRecipient")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>{t("tracking.quickVerification")}</span>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-accent/10 rounded border border-accent/20">
                  <Fingerprint className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-xs font-medium text-accent">{t("tracking.readyForVerification")}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={downloadReceipt}>
                <Download className="w-4 h-4 mr-2" />
                {t("tracking.downloadReceipt")}
              </Button>
              
              <Button 
                onClick={onReturnHome}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("tracking.returnToDashboard")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;