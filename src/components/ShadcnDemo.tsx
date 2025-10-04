'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Mail, Phone, User, Settings, LogOut, Menu, Star, Heart, Share2, Moon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface FormData {
  name: string;
  email: string;
  message: string;
  category: string;
}

export default function ShadcnDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
      category: '',
    },
  });

  const onSubmit = (data: FormData) => {
    toast.success('Form submitted successfully!', {
      description: `Thank you ${data.name}, we'll get back to you soon.`,
    });
    setDialogOpen(false);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header with theme toggle */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">shadcn/ui Components Demo</h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive showcase with light and dark mode support
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="container-responsive">
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="themes">Dark Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>Various button styles and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon" variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Status indicators and labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                  <CardDescription>User profile pictures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Input Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Input Fields</CardTitle>
                  <CardDescription>Text inputs and form controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-input">Email</Label>
                    <Input id="demo-input" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-textarea">Message</Label>
                    <Textarea id="demo-textarea" placeholder="Type your message here" />
                  </div>
                </CardContent>
              </Card>

              {/* Select */}
              <Card>
                <CardHeader>
                  <CardTitle>Select</CardTitle>
                  <CardDescription>Dropdown selection menus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="demo-select">Choose a framework</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">Next.js</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue.js</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Card Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Job Posting
                  </CardTitle>
                  <CardDescription>Frontend Developer at Tech Company</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We're looking for a talented frontend developer to join our team...
                  </p>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Badge>React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="outline">Remote</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm">Apply Now</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>React Hook Form Integration</CardTitle>
                <CardDescription>Forms with validation using react-hook-form</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about yourself..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Submit Form</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Dropdown Menu */}
              <Card>
                <CardHeader>
                  <CardTitle>Dropdown Menu</CardTitle>
                  <CardDescription>Context menus and action dropdowns</CardDescription>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Options
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>

              {/* Sheet (Drawer) */}
              <Card>
                <CardHeader>
                  <CardTitle>Sheet / Drawer</CardTitle>
                  <CardDescription>Slide-out panels and mobile menus</CardDescription>
                </CardHeader>
                <CardContent>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <Menu className="h-4 w-4 mr-2" />
                        Open Menu
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>
                          Access all the main features of the application
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <Button variant="ghost" className="justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                        <Button variant="ghost" className="justify-start">
                          <Mail className="h-4 w-4 mr-2" />
                          Jobs
                        </Button>
                        <Button variant="ghost" className="justify-start">
                          <Phone className="h-4 w-4 mr-2" />
                          Applications
                        </Button>
                        <Button variant="ghost" className="justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Dialog */}
              <Card>
                <CardHeader>
                  <CardTitle>Dialog / Modal</CardTitle>
                  <CardDescription>Modal dialogs and confirmations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact Us</DialogTitle>
                        <DialogDescription>
                          Get in touch with our team. We'll respond within 24 hours.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input id="name" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input id="email" type="email" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={() => {
                          toast.success('Message sent!');
                          setDialogOpen(false);
                        }}>
                          Send Message
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Toast */}
              <Card>
                <CardHeader>
                  <CardTitle>Toast Notifications</CardTitle>
                  <CardDescription>User feedback and status messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => toast.success('Success!', { description: 'Your action was completed successfully.' })}
                  >
                    Success Toast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.error('Error!', { description: 'Something went wrong. Please try again.' })}
                  >
                    Error Toast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.info('Info', { description: 'Here\'s some helpful information.' })}
                  >
                    Info Toast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.warning('Warning!', { description: 'Please check your input.' })}
                  >
                    Warning Toast
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Dark Mode Showcase</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience seamless dark mode transitions across all components. Use the theme toggle in the header to switch between light, dark, and system themes.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Theme Examples */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Theme Colors</CardTitle>
                  <CardDescription>CSS variables adapt automatically</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-background border rounded flex items-center justify-center text-xs">
                      Background
                    </div>
                    <div className="h-8 bg-foreground rounded flex items-center justify-center text-xs text-background">
                      Foreground
                    </div>
                    <div className="h-8 bg-primary rounded flex items-center justify-center text-xs text-primary-foreground">
                      Primary
                    </div>
                    <div className="h-8 bg-secondary rounded flex items-center justify-center text-xs text-secondary-foreground">
                      Secondary
                    </div>
                    <div className="h-8 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      Muted
                    </div>
                    <div className="h-8 bg-accent rounded flex items-center justify-center text-xs text-accent-foreground">
                      Accent
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Component Variants</CardTitle>
                  <CardDescription>All variants work in both themes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  <Input placeholder="Dark mode compatible input" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interactive Elements</CardTitle>
                  <CardDescription>Hover and focus states adapt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => toast.success('Dark mode toast!')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Trigger Toast
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Menu className="h-4 w-4 mr-2" />
                        Dark Mode Menu
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Light Theme</DropdownMenuItem>
                      <DropdownMenuItem>Dark Theme</DropdownMenuItem>
                      <DropdownMenuItem>System Theme</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Moon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">🌙 Dark Mode Ready!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    All shadcn/ui components seamlessly adapt to your preferred theme with smooth transitions and perfect contrast ratios.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="success">Accessible</Badge>
                    <Badge variant="info">Responsive</Badge>
                    <Badge variant="secondary">Smooth Transitions</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">🎉 shadcn/ui with Dark Mode Successfully Integrated!</h3>
              <p className="text-muted-foreground">
                All components are properly configured with your existing theme and support both light and dark modes with seamless transitions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}