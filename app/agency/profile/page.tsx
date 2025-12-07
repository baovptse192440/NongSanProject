"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ToastContainer from "../../common/Toast";
import { useToast } from "../../common/useToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { enAU } from "date-fns/locale";
import {
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CalendarIcon,
  Edit2,
  Package,
  Eye,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  avatar: string;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other" | null;
  status: string;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

// Australian states
const AUSTRALIAN_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "WA", label: "Western Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "NT", label: "Northern Territory" },
  { value: "ACT", label: "Australian Capital Territory" },
];

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, toast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Array<{
    id: string;
    orderNumber: string;
    items: Array<{ productName: string; quantity: number }>;
    total: number;
    status: string;
    createdAt: string;
  }>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Australia",
    dateOfBirth: null as Date | null,
    gender: "" as "male" | "female" | "other" | "",
  });

  // Read tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders") {
      setActiveTab("orders");
    } else {
      setActiveTab("profile");
    }
  }, [searchParams]);

  // Check authentication and fetch user data
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthAndFetchUser = async () => {
      try {
        // First check if token exists
        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) {
            setLoading(false);
            router.push("/login?redirect=/agency/profile");
          }
          return;
        }

        // Verify token is still valid by calling API
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (!isMounted) return;

        if (result.success && result.data) {
          const userData = result.data;
          setUser(userData);
          setFormData({
            fullName: userData.fullName || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            zipCode: userData.zipCode || "",
            country: userData.country || "Australia",
            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth)
              : null,
            gender: userData.gender || "",
          });
        } else {
          // Token invalid or expired
          if (isMounted) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setLoading(false);
            toast.error("Error", "Session expired. Please login again");
            router.push("/login?redirect=/agency/profile");
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (isMounted) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setLoading(false);
          toast.error("Error", "Failed to load user information");
          router.push("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthAndFetchUser();

    // Listen for storage changes (when token is removed on logout from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        // Token was removed, redirect to login
        if (isMounted) {
          setUser(null);
          router.push("/login");
        }
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      if (isMounted) {
        setUser(null);
        router.push("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedOut", handleLogout);
    
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch orders
  useEffect(() => {
    if (activeTab === "orders" && user) {
      const fetchOrders = async () => {
        try {
          setOrdersLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            return;
          }

          const response = await fetch("/api/orders?limit=20&page=1", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const result = await response.json();

          if (result.success) {
            setOrders(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  const formatPrice = (price: number) => {
    return "$" + price.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: enAU });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split("T")[0] : "",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Success", "Profile updated successfully");
        setUser(result.data);
        setEditing(false);
        
        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(result.data));
          // Debounce event dispatch to prevent infinite loops
          setTimeout(() => {
            window.dispatchEvent(new Event("userUpdated"));
          }, 100);
        }
      } else {
        toast.error("Error", result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error", "An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Success", result.message || "Verification email sent");
      } else {
        toast.error("Error", result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Error", "An error occurred while sending email");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <div className="hidden md:block">
          
        </div>
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Loading information...</p>
          </div>
        </div>
      
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-[#eeeeee] md:mt-20 mt-16">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="hidden md:block">
        
      </div>

      {/* Breadcrumb - Desktop */}
      <div className="hidden md:flex overflow-x-auto bg-[#e6e6e6] border-gray-200">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/agency" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Account Information</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4 py-6 md:py-10">
        {/* Tabs */}
        <div className="bg-white md:rounded-sm mb-6 border-b border-gray-200">
          <div className="flex gap-1 p-1">
            <Link
              href="/agency/profile"
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors text-center ${
                activeTab === "profile"
                  ? "bg-[#0a923c] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Profile
            </Link>
            <Link
              href="/agency/profile?tab=orders"
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors text-center ${
                activeTab === "orders"
                  ? "bg-[#0a923c] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Orders
            </Link>
          </div>
        </div>

        {activeTab === "profile" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Account Information
              </h1>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-green-700 hover:bg-green-800 text-white"
                >
                  <Edit2 size={18} />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-sm shadow-md border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-700" />
                  Basic Information
                </h2>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                {/* Email - Read only */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    {!user.emailVerified && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-orange-600">Email not verified</span>
                        <Button
                          variant="link"
                          onClick={handleSendVerificationEmail}
                          className="text-sm text-green-700 p-0 h-auto"
                        >
                          Send verification email
                        </Button>
                      </div>
                    )}
                    {user.emailVerified && (
                      <span className="text-xs text-green-600 mt-1 block">✓ Email verified</span>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1 block">
                    Full Name
                  </Label>
                  {editing ? (
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{user.fullName || "Not set"}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {editing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., +61 4XX XXX XXX"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{user.phone || "Not set"}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  {editing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-10"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfBirth ? (
                            format(formData.dateOfBirth, "PPP", { locale: enAU })
                          ) : (
                            <span className="text-gray-500">Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-xl rounded-xl" 
                        align="start" 
                        side="bottom"
                        sideOffset={8}
                      >
                        <CalendarComponent
                          mode="single"
                          selected={formData.dateOfBirth || undefined}
                          onSelect={(date) => {
                            setFormData({ ...formData, dateOfBirth: date || null });
                          }}
                          initialFocus
                          locale={enAU}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-3",
                            caption: "flex justify-center pt-2 relative items-center",
                            caption_label: "text-sm font-medium text-gray-900",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent hover:bg-gray-100 rounded-md p-0 opacity-70 hover:opacity-100 transition-colors",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-1",
                            cell: "h-9 w-9 text-center text-sm p-0 relative",
                            day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 aria-selected:opacity-100 transition-colors",
                            day_selected: "bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white",
                            day_today: "bg-gray-100 text-gray-900 font-medium",
                            day_outside: "text-gray-400 opacity-50",
                            day_disabled: "text-gray-300 opacity-50",
                            day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-gray-900 mt-1">
                      {user.dateOfBirth
                        ? (() => {
                            try {
                              return format(new Date(user.dateOfBirth), "PPP", { locale: enAU });
                            } catch {
                              return new Date(user.dateOfBirth).toLocaleDateString("en-AU");
                            }
                          })()
                        : "Not set"}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-1 block">
                    Gender
                  </Label>
                  {editing ? (
                    <Select
                      value={formData.gender || undefined}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value as "male" | "female" | "other" | "" })
                      }
                    >
                      <SelectTrigger id="gender" className="w-full h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-xl rounded-lg p-1">
                        <SelectItem value="male" className="cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-100">Male</SelectItem>
                        <SelectItem value="female" className="cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-100">Female</SelectItem>
                        <SelectItem value="other" className="cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-100">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 mt-1">
                      {user.gender === "male"
                        ? "Male"
                        : user.gender === "female"
                        ? "Female"
                        : user.gender === "other"
                        ? "Other"
                        : "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-sm shadow-md border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-700" />
                  Shipping Address
                </h2>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Street Address
                  </Label>
                  {editing ? (
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street number and name"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{user.address || "Not set"}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City/Suburb */}
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1 block">
                      City/Suburb
                    </Label>
                    {editing ? (
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City or Suburb"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{user.city || "Not set"}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-1 block">
                      State
                    </Label>
                    {editing ? (
                      <Select
                        value={formData.state || undefined}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger id="state" className="w-full h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-xl rounded-lg p-1 max-h-[300px]">
                          {AUSTRALIAN_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value} className="cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-100">
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900 mt-1">
                        {user.state
                          ? AUSTRALIAN_STATES.find((s) => s.value === user.state)?.label || user.state
                          : "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Postcode */}
                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 mb-1 block">
                      Postcode
                    </Label>
                    {editing ? (
                      <Input
                        id="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setFormData({ ...formData, zipCode: value });
                        }}
                        placeholder="e.g., 2000"
                        maxLength={4}
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{user.zipCode || "Not set"}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-1 block">
                      Country
                    </Label>
                    {editing ? (
                      <Input
                        id="country"
                        type="text"
                        value={formData.country}
                        disabled
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{user.country || "Australia"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false);
                    // Reset form data
                    if (user) {
                      setFormData({
                        fullName: user.fullName || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        city: user.city || "",
                        state: user.state || "",
                        zipCode: user.zipCode || "",
                        country: user.country || "Australia",
                        dateOfBirth: user.dateOfBirth
                          ? new Date(user.dateOfBirth)
                          : null,
                        gender: user.gender || "",
                      });
                    }
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT - Account Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-md border border-gray-200 sticky top-[100px]">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Account Summary</h2>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-sm font-medium mt-1 ${
                    user.status === "active" ? "text-green-600" : "text-red-600"
                  }`}>
                    {user.status === "active" ? "Active" : "Inactive"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-sm font-medium mt-1 text-gray-900">
                    {user.role === "admin" ? "Administrator" : "User"}
                  </p>
                </div>

                {user.lastLogin && (
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="text-sm font-medium mt-1 text-gray-900">
                      {user.lastLogin
                        ? (() => {
                            try {
                              return format(new Date(user.lastLogin), "PPpp", { locale: enAU });
                            } catch {
                              return new Date(user.lastLogin).toLocaleString("en-AU");
                            }
                          })()
                        : "N/A"}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-sm font-medium mt-1 text-gray-900">
                    {user.createdAt
                      ? (() => {
                          try {
                            return format(new Date(user.createdAt), "PPP", { locale: enAU });
                          } catch {
                            return new Date(user.createdAt).toLocaleDateString("en-AU");
                          }
                        })()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="bg-white md:rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
              <p className="text-xs text-gray-500 mt-1">View and manage your order history</p>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  <p className="text-xs text-gray-500">Loading orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900 mb-1">No orders yet</p>
                <p className="text-xs text-gray-500 mb-4">Start shopping to see your orders here</p>
                <Link
                  href="/agency/category"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 mb-1 truncate">
                              {order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 ml-13">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Total: {formatPrice(order.total)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:ml-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <Link
                          href={`/agency/profile/orders/${order.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
