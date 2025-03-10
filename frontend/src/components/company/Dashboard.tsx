import { useEffect, useState, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import api from '@/api/axios';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ScaleLoader } from 'react-spinners';

const COLORS = [
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#e74c3c',
  '#9b59b6',
  '#1abc9c',
  '#34495e',
  '#f1c40f',
];
const TASK_THRESHOLD_HIGH = 15;
const TASK_THRESHOLD_MEDIUM = 10;

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        bgcolor: color,
      }}
    />
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={0.5}>
              {trend === 'up' ? (
                <TrendingUpIcon fontSize="small" sx={{ color: '#2ecc71' }} />
              ) : (
                <TrendingDownIcon fontSize="small" sx={{ color: '#e74c3c' }} />
              )}
              <Typography
                variant="caption"
                sx={{ ml: 0.5, color: trend === 'up' ? '#2ecc71' : '#e74c3c' }}
              >
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color: color }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const PerformanceBadge = ({ name, avatar, metric, rank }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      p: 1.5,
      borderRadius: '8px',
      backgroundColor: rank === 1 ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
      border: rank === 1 ? '1px solid rgba(241, 196, 15, 0.3)' : 'none',
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: COLORS[(rank - 1) % COLORS.length],
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        mr: 2,
      }}
    >
      {rank}
    </Box>
    <Avatar sx={{ mr: 2 }}>{name?.charAt(0) || '?'}</Avatar>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle2">{name || 'Unknown'}</Typography>
      <Typography variant="caption" color="textSecondary">
        {metric || 0} tasks completed
      </Typography>
    </Box>
    {rank === 1 && <EmojiEventsIcon sx={{ color: '#f1c40f' }} />}
  </Box>
);

const ChartCard = ({ title, children, height = 300 }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}
  >
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="medium">
          {title}
        </Typography>
        <IconButton size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box height={height}>{children}</Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/company/dashboard', {
        withCredentials: true,
      });

      const data = response.data.data;
      console.log('Dashboard data received:', data);

      if (!data.employees.bestPerformers) {
        data.employees.bestPerformers =
          data.employees.workload
            ?.sort((a, b) => b.taskCount - a.taskCount)
            ?.slice(0, 5) || [];
      }

      if (!data.projects) data.projects = { total: 0, statusChart: [] };
      if (!data.tasks)
        data.tasks = { total: 0, statusChart: [], overdue: 0, dueSoon: 0 };
      if (!data.employees)
        data.employees = {
          total: 0,
          byDepartment: [],
          workload: [],
          bestPerformers: [],
        };

      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const completionRate = useMemo(() => {
    if (!dashboardData?.tasks?.statusChart?.length) return '0%';

    const completedTasks =
      dashboardData.tasks.statusChart.find(s => s._id === 'Completed')?.count ||
      0;
    const totalTasks = dashboardData.tasks.total || 1;

    return `${Math.round((completedTasks / totalTasks) * 100)}%`;
  }, [dashboardData]);

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-96">
        <ScaleLoader color="#3B82F6" />
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Error loading data
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {error}. Please try refreshing the page or contact support if the
          issue persists.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!dashboardData && !refreshing) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No dashboard data available
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Please try refreshing the page or contact support if the issue
          persists.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const { projects = {}, tasks = {}, employees = {} } = dashboardData || {};

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Company Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {refreshing && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={projects.total || 0}
            icon={<AssignmentIcon />}
            color="#3498db"
            trend="up"
            trendValue={8.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={tasks.total || 0}
            icon={<TimelineIcon />}
            color="#2ecc71"
            trend="up"
            trendValue={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={employees.total || 0}
            icon={<PeopleIcon />}
            color="#f39c12"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={completionRate}
            icon={<TrendingUpIcon />}
            color="#e74c3c"
            trend={tasks.total > 0 ? 'up' : 'down'}
            trendValue={5.3}
          />
        </Grid>

        {/* Best Performers Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="medium">
                  Top Performers
                </Typography>
                <Chip
                  label="This Month"
                  size="small"
                  sx={{
                    borderRadius: '4px',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    color: '#3498db',
                    fontWeight: 'medium',
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Box>
                {(employees.bestPerformers || []).map((employee, index) => (
                  <PerformanceBadge
                    key={index}
                    name={employee.name}
                    avatar={employee.profilePicture || null}
                    metric={employee.taskCount}
                    rank={index + 1}
                  />
                ))}
                {(employees.bestPerformers || []).length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', py: 3 }}
                  >
                    No performer data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Status Chart */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Project Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projects.statusChart || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {(projects.statusChart || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} projects`, name]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Task Status">
            <ResponsiveContainer width="50%" height="100%">
              <BarChart data={tasks.statusChart || []}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2ecc71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Employee Distribution by Department">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employees.byDepartment || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name || 'Unknown'}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {(employees.byDepartment || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} employees`,
                    name || 'Unknown',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Employee Workload */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="medium" mb={3}>
                Employee Workload Distribution
              </Typography>

              <Grid container spacing={3}>
                {(employees.workload || []).map((employee, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(52, 152, 219, 0.05)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          mb: 1.5,
                          bgcolor: COLORS[index % COLORS.length],
                        }}
                      >
                        {employee.name?.charAt(0) || '?'}
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        noWrap
                      >
                        {employee.name || 'Unknown'}
                      </Typography>
                      <Box
                        sx={{
                          my: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{ position: 'relative', display: 'inline-flex' }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={Math.min(
                              ((employee.taskCount || 0) / 20) * 100,
                              100
                            )}
                            size={60}
                            thickness={5}
                            sx={{
                              color:
                                (employee.taskCount || 0) > TASK_THRESHOLD_HIGH
                                  ? '#e74c3c'
                                  : (employee.taskCount || 0) >
                                      TASK_THRESHOLD_MEDIUM
                                    ? '#f39c12'
                                    : '#2ecc71',
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="div"
                              color="text.secondary"
                            >
                              {employee.taskCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
                {(employees.workload || []).length === 0 && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', py: 3 }}
                    >
                      No workload data available
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
