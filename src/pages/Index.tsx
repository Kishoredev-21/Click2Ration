import { useState } from "react";
import Login from "@/components/Login";
import OTPVerification from "@/components/OTPVerification";
import Dashboard from "@/components/Dashboard";
import ProductSelection from "@/components/ProductSelection";
import OrderConfirmation from "@/components/OrderConfirmation";
import TrackingPage from "@/components/TrackingPage";
import LanguageToggle from "@/components/LanguageToggle";
import RationBot from "@/components/RationBot";

type AppState = "login" | "otp" | "dashboard" | "products" | "confirmation" | "tracking";

interface OrderItem {
  id: string;
  quantity: number;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("login");
  const [userMobile, setUserMobile] = useState("");
  const [rationNumber, setRationNumber] = useState("");
  const [familySize, setFamilySize] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  const handleLogin = (rationNumber: string, mobile: string) => {
    setUserMobile(mobile);
    setRationNumber(rationNumber);
    setCurrentState("otp");
  };

  const handleOTPVerify = (selectedMembers: string[]) => {
    // Get family size from ration card number
    const familySizeMap: Record<string, number> = {
      "123456789012": 2,
      "234567890123": 3,
      "345678901234": 4,
      "456789012345": 5,
    };
    setFamilySize(familySizeMap[rationNumber] || 2);
    setCurrentState("dashboard");
  };

  const handleProductSelection = () => {
    setCurrentState("products");
  };

  const handleOrderConfirm = (products: OrderItem[], total: number) => {
    setSelectedProducts(products);
    setOrderTotal(total);
    setCurrentState("confirmation");
  };

  const handleFinalConfirm = () => {
    setCurrentState("tracking");
  };

  const handleReturnHome = () => {
    setCurrentState("dashboard");
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "login":
        return <Login onLogin={handleLogin} />;
      
      case "otp":
        return <OTPVerification mobileNumber={userMobile} rationNumber={rationNumber} onVerify={handleOTPVerify} />;
      
      case "dashboard":
        return <Dashboard familySize={familySize} onSelectProducts={handleProductSelection} onBackToLogin={() => setCurrentState("login")} />;
      
      case "products":
        return (
          <ProductSelection
            familySize={familySize}
            onBack={() => setCurrentState("dashboard")}
            onOrderConfirm={handleOrderConfirm}
          />
        );
      
      case "confirmation":
        return (
          <OrderConfirmation
            selectedProducts={selectedProducts}
            totalAmount={orderTotal}
            onBack={() => setCurrentState("products")}
            onConfirm={handleFinalConfirm}
          />
        );
      
      case "tracking":
        return <TrackingPage onReturnHome={handleReturnHome} />;
      
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <>
      <LanguageToggle />
      {renderCurrentView()}
      <RationBot />
    </>
  );
};

export default Index;
