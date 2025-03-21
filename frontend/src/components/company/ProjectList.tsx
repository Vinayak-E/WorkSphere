import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Users,
  AlertCircle,
  BadgeInfo,
  CheckCircle,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectController } from '@/controllers/employee/project.controller';
import { IProject } from '@/types/IProject';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
const ProjectList = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const projectsPerPage = 6;

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const { data, totalPages } = await ProjectController.getAllProjects({
          page: currentPage,
          limit: projectsPerPage,
          search: debouncedSearch,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        });
        console.log('data', data);
        setProjects(data);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [currentPage, debouncedSearch, selectedStatus]);

  const getStatusDetails = (status: string) => {
    const statusMap: {
      [key: string]: { color: string; bgColor: string; icon: JSX.Element };
    } = {
      Completed: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      'In Progress': {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        icon: <BadgeInfo className="w-4 h-4" />,
      },
      Pending: {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: <AlertCircle className="w-4 h-4" />,
      },
    };
    return (
      statusMap[status] || {
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        icon: <AlertCircle className="w-4 h-4" />,
      }
    );
  };

  const calculateProgress = (project: IProject) => {
    if (project.status === 'Completed') return 100;
    if (project.totalTasks && project.totalTasks > 0) {
      return ((project.completedTasks || 0) / project.totalTasks) * 100;
    }

    if (!project.deadline || !project.createdAt) return 0;
    if (project.status as 'Completed') return 100;

    const start = new Date(project.createdAt).getTime();
    const end = new Date(project.deadline).getTime();
    const now = Date.now();

    return Math.min(((now - start) / (end - start)) * 100, 100);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Project Dashboard
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Manage and track company initiatives
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-gray-600" />
            <span className=" text-gray-600">
              {projects.length} Active Projects
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 bg-gray-50 p-4 rounded-xl space-y-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-gray-200 focus:border-indigo-500 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-12 min-w-[160px] border-gray-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => {
            const statusDetails = getStatusDetails(project.status);
            const progress = calculateProgress(project);
            const isOverdue =
              project.deadline && new Date(project.deadline) < new Date();

            return (
              <Card
                key={project._id}
                className="group hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-xl overflow-hidden"
              >
                <CardContent className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent h-24" />

                  <div className="relative space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                        {project.name}
                      </h3>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                          statusDetails.color,
                          statusDetails.bgColor
                        )}
                      >
                        {statusDetails.icon}
                        {project.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                    {project.department && (
  <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
    {typeof project.department === 'object' 
      ? project.department.name 
      : project.department}
  </span>
                      )}
                     {project.manager && (
  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
    👤 {typeof project.manager === 'object' 
      ? project.manager.name 
      : project.manager}
  </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed min-h-[40px]">
                      {project.description}
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Progress
                          </span>
                          <span className="text-sm font-bold text-indigo-600">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className={cn(
                            'h-2 bg-gray-100 [&>div]:transition-all',
                            progress === 100
                              ? '[&>div]:bg-green-500'
                              : '[&>div]:bg-indigo-500'
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {project.employees?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600"></div>
                        {project.deadline && (
                          <div className="flex items-center gap-2 justify-end">
                            <Clock className="w-4 h-4" />
                            <span
                              className={cn(
                                'text-sm font-medium',
                                isOverdue ? 'text-red-600' : 'text-gray-600'
                              )}
                            >
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigate(`/company/projects/${project._id}`)
                      }
                      className="w-full mt-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                    >
                      View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {[...Array(projectsPerPage)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-gray-100 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                  <div className="h-4 bg-gray-100 rounded-lg w-full" />
                  <div className="h-2 bg-gray-100 rounded-full w-full" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-100 rounded-lg" />
                    <div className="h-4 bg-gray-100 rounded-lg" />
                    <div className="h-4 bg-gray-100 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-w-[100px] gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="min-w-[100px] gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectList;
