import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Linkedin, Mail, Phone, MapPin, Briefcase, Calendar, Globe, Home, ExternalLink, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user } = useAuth();
  
  const linkedInDetails = {
    name: user?.name || user?.username || "Sansia A",
    title: "Software Engineer | Web Developer | Game Developer",
    location: "Yogyakarta, Indonesia",
    connections: 217,
    about: "I work at the intersection of technology, art, and storytelling. As a software engineer with a strong background in web development and 3D game development, I combine technical skills with creative vision to build interactive experiences that engage and inspire. With experience across various programming languages and frameworks, I'm dedicated to creating elegant solutions to complex problems.",
    experience: [
      {
        title: "Software Engineer",
        company: "Freelance",
        duration: "Mar 2022 - Present",
        description: "Working on diverse software projects across web development and application design. Specializing in creating interactive and user-friendly interfaces."
      },
      {
        title: "Game Developer",
        company: "Independent Projects",
        duration: "Jan 2020 - Present",
        description: "Developing interactive 3D games with Unity and Unreal Engine. Creating engaging gameplay mechanics and immersive environments."
      },
      {
        title: "Web Developer",
        company: "Various Clients",
        duration: "Sep 2019 - Present",
        description: "Building responsive websites and web applications using modern frameworks and best practices. Focus on clean code architecture and optimal performance."
      }
    ],
    education: [
      {
        school: "Universitas Gadjah Mada",
        degree: "Bachelor's degree, Computer Science",
        duration: "2019 - 2023"
      }
    ],
    skills: [
      "JavaScript", 
      "React.js", 
      "Node.js", 
      "TypeScript", 
      "Python",
      "Unity 3D",
      "Unreal Engine",
      "C#",
      "UI/UX Design",
      "Full-Stack Development"
    ],
    recommendations: [
      {
        name: "Alex Thompson",
        title: "Senior Web Developer at TechSolutions",
        text: "Sansia's ability to transform complex requirements into elegant code is impressive. Her attention to detail and commitment to quality makes her an invaluable team member."
      },
      {
        name: "Maya Patel",
        title: "Game Design Director",
        text: "Working with Sansia on our game development project was a fantastic experience. She brings both technical expertise and creative insights to every challenge."
      }
    ]
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 min-h-screen bg-neutral-50">
        <MobileHeader />
        
        <section className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">My Profile</h1>
            <p className="text-neutral-600">View and manage your profile information</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
                      {linkedInDetails.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{linkedInDetails.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-primary mb-2">
                    {linkedInDetails.title}
                  </CardDescription>
                  <div className="flex items-center text-sm text-neutral-600 mb-4">
                    <MapPin size={16} className="mr-1" />
                    <span>{linkedInDetails.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline" size="sm" className="rounded-full mr-2">
                      <Mail size={16} className="mr-1" />
                      <span>Message</span>
                    </Button>
                    <a href="https://www.linkedin.com/in/sansia-a-603816297/" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="rounded-full bg-[#0077B5] hover:bg-[#0077B5]/90">
                        <Linkedin size={16} className="mr-1" />
                        <span>Connect</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-t border-neutral-200 pt-4">
                  <div className="text-sm text-neutral-600 mb-4">
                    <div className="font-medium text-neutral-800 mb-1">Contact Info</div>
                    <div className="flex items-center mb-2">
                      <Mail size={14} className="mr-2 text-neutral-500" />
                      <span>{user?.email || "email@example.com"}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Phone size={14} className="mr-2 text-neutral-500" />
                      <span>{user?.phone || "+1 (555) 123-4567"}</span>
                    </div>
                    <div className="flex items-center">
                      <Linkedin size={14} className="mr-2 text-neutral-500" />
                      <a href="https://www.linkedin.com/in/sansia-a-603816297/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">linkedin.com/in/sansia-a-603816297</a>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4 text-sm">
                    <div className="font-medium text-neutral-800 mb-2">Connections</div>
                    <p>{linkedInDetails.connections}+ connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Details */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <Tabs defaultValue="about">
                  <TabsList className="grid grid-cols-4 bg-neutral-100">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="pt-4">
                    <CardTitle className="text-lg mb-2">About</CardTitle>
                    <p className="text-neutral-700">{linkedInDetails.about}</p>
                  </TabsContent>
                  
                  <TabsContent value="experience" className="pt-4 space-y-5">
                    <CardTitle className="text-lg mb-2">Experience</CardTitle>
                    {linkedInDetails.experience.map((exp, index) => (
                      <div key={index} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-neutral-100 rounded p-2 mr-3">
                            <Briefcase size={20} className="text-neutral-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-800">{exp.title}</h3>
                            <div className="text-primary font-medium text-sm">{exp.company}</div>
                            <div className="text-neutral-500 text-sm flex items-center mt-1">
                              <Calendar size={14} className="mr-1" />
                              <span>{exp.duration}</span>
                            </div>
                            <p className="mt-2 text-neutral-700">{exp.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="education" className="pt-4">
                    <CardTitle className="text-lg mb-2">Education</CardTitle>
                    {linkedInDetails.education.map((edu, index) => (
                      <div key={index} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-neutral-100 rounded p-2 mr-3">
                            <Globe size={20} className="text-neutral-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-800">{edu.school}</h3>
                            <div className="text-primary font-medium text-sm">{edu.degree}</div>
                            <div className="text-neutral-500 text-sm flex items-center mt-1">
                              <Calendar size={14} className="mr-1" />
                              <span>{edu.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="skills" className="pt-4">
                    <CardTitle className="text-lg mb-2">Skills</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {linkedInDetails.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <CardTitle className="text-lg mb-2 mt-6">Recommendations</CardTitle>
                    <div className="space-y-4">
                      {linkedInDetails.recommendations.map((rec, index) => (
                        <div key={index} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                          <p className="text-neutral-700 italic mb-2">"{rec.text}"</p>
                          <div className="font-semibold text-neutral-800">{rec.name}</div>
                          <div className="text-neutral-500 text-sm">{rec.title}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
            
            {/* App Activity Card */}
            <Card className="lg:col-span-3 mt-2">
              <CardHeader>
                <CardTitle>AppCopilot Activity</CardTitle>
                <CardDescription>Your recent activity on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Home size={20} className="text-primary mr-2" />
                      <h3 className="font-semibold">Saved Properties</h3>
                    </div>
                    <div className="text-3xl font-bold mb-2">3</div>
                    <Link href="/favorites">
                      <Button variant="link" className="p-0 h-auto text-primary">
                        View Favorites <ExternalLink size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Search size={20} className="text-primary mr-2" />
                      <h3 className="font-semibold">Saved Searches</h3>
                    </div>
                    <div className="text-3xl font-bold mb-2">0</div>
                    <Link href="/search">
                      <Button variant="link" className="p-0 h-auto text-primary">
                        Search Properties <ExternalLink size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Bell size={20} className="text-primary mr-2" />
                      <h3 className="font-semibold">Active Alerts</h3>
                    </div>
                    <div className="text-3xl font-bold mb-2">0</div>
                    <Link href="/alerts">
                      <Button variant="link" className="p-0 h-auto text-primary">
                        Manage Alerts <ExternalLink size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <MobileNav />
      </main>
    </div>
  );
}