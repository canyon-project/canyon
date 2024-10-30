import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import prisma from "@/lib/prisma";
// import { useQuery } from "@apollo/client";
// import { GetCoverageLogsDocument } from "@/helpers/backend/gen/graphql.ts";
const ProjectPage =async () => {
  // const { data } = useQuery(GetCoverageLogsDocument);
  const feed = await prisma.coverage.findMany({
    where: { },
    skip: 10,
    take: 15,
    select:{
      id:true,
      projectID:true,
      sourceType:true,
      sha:true,
    }
  });
  console.log(feed,'feed')
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Retrieve</CardTitle>
          <CardDescription>
            Retrieve repository coverage by repository name, repository ID, commit sha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sha</TableHead>
                <TableHead>Repo</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead className="hidden md:table-cell">
                  Origin
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Source Type
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/*{JSON.stringify(feed)}*/}
              {
                feed.map((item) => {
                  return <TableRow>
                    <TableCell className="font-medium">
                      {item.sha}
                    </TableCell>
                    <TableCell>
                      canyon-project/canyon({item.projectID})
                    </TableCell>
                    <TableCell>90%</TableCell>
                    <TableCell>Job Pull</TableCell>
                    <TableCell className="hidden md:table-cell">xml</TableCell>
                  </TableRow>
                })
              }
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-10</strong> of <strong>32</strong> products
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProjectPage;
