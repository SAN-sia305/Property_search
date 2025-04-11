import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
      phone: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };

  // Handle register form submission
  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-primary">
                  AppCopilot
                </CardTitle>
                <CardDescription className="text-sm">
                  Your property companion
                </CardDescription>
              </div>
            </div>
            <p className="text-neutral-600 mt-2 text-sm">
              Find, compare, and track rental properties in a seamless experience
            </p>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-neutral-100 rounded-lg">
                <TabsTrigger 
                  value="login"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="animate-slide-up">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-700">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-700">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="remember-me"
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </FormControl>
                            <FormLabel htmlFor="remember-me" className="text-sm cursor-pointer text-neutral-600">
                              Remember me
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <a href="#" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 h-12 px-6 rounded-lg shadow-sm mt-4 transition-colors" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-8 text-center">
                  <p className="text-neutral-600">
                    Don't have an account?{" "}
                    <button 
                      className="font-medium text-primary hover:text-primary-600 transition-colors"
                      onClick={() => setActiveTab("register")}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="animate-slide-up">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-700">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your full name" 
                                className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-700">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-700">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-700">Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your phone number" 
                              className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-700">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Choose a password" 
                              className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 h-12 px-6 rounded-lg shadow-sm mt-2 transition-colors" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-8 text-center">
                  <p className="text-neutral-600">
                    Already have an account?{" "}
                    <button 
                      className="font-medium text-primary hover:text-primary-600 transition-colors"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Image/Brand Side */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-neutral-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]"></div>
        <div className="h-full flex flex-col items-center justify-center p-12 relative z-10">
          <div className="max-w-xl text-center mb-10">
            <h1 className="text-5xl font-bold text-primary mb-6">
              Find Your Perfect Home
            </h1>
            <p className="text-xl text-neutral-700 leading-relaxed">
              Discover, compare, and save rental properties with our powerful comparison tools. Make informed decisions and find your ideal living space effortlessly.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full max-w-3xl mb-10">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m21 11-8-8-9 9v2h2l9-9 5 5V7h2v4z"></path><path d="M6 14v4"></path><path d="M14 6H8.5"></path><path d="M8.5 6v4.5"></path><path d="M10 13v1"></path><path d="M14 17v.01"></path><path d="M18 15v.01"></path><path d="M6 18h12"></path><path d="M2 22h20"></path></svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Easy Search</h3>
              <p className="text-neutral-600 text-sm">Find properties that match your exact criteria</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Save & Compare</h3>
              <p className="text-neutral-600 text-sm">Keep track of favorites and compare options</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h6"></path><path d="M9 17h3"></path></svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Get Alerts</h3>
              <p className="text-neutral-600 text-sm">Receive notifications when new properties match your criteria</p>
            </div>
          </div>
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-xl shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
              alt="Modern apartment buildings" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 border border-white/20 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
