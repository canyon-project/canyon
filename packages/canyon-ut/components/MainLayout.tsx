import {
  Book,
  ChevronLeft,
  Folder,
  Home,
  LifeBuoy,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  Users2,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { Link } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
// const Image = () => <div></div>;
import logo from "@/app/logo.svg";
import { Separator } from "@/components/ui/separator.tsx";
import Link from "next/link";
import Image from "next/image";
const MainLayout = ({ children, activePath }) => {
  const menuItems = [
    {
      icon: <Folder className="h-5 w-5" />,
      label: "Projects",
      to: "projects",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      to: "settings",
    },
  ];
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Image src={logo} width={30} height={30} alt={'logo'} />
          <Separator />
          {menuItems.map((item) => {
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    to={"/" + item.to}
                    // className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      activePath === item.to ? "bg-accent" : "",
                    )}
                  >
                    {item.icon}
                    <span className="sr-only">{item.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <a href="https://docs.canyoncov.com/" target={"_blank"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Help"
                >
                  <Book className="size-5" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Docs
            </TooltipContent>
          </Tooltip>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <div href="#">Dashboard</div>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <div href="#">Products</div>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                {/*<Image*/}
                {/*  src="/placeholder-user.jpg"*/}
                {/*  width={36}*/}
                {/*  height={36}*/}
                {/*  alt="Avatar"*/}
                {/*  className="overflow-hidden rounded-full"*/}
                {/*/>*/}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto w-[1250px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
