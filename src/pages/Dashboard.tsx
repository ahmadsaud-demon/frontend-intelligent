import React, { useState, useEffect } from 'react';
import { BookOpen, Users, GraduationCap, Award, Building2, Activity, CreditCard, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import { getApiUsage, getBillingOverview, getSubscriptions } from '../lib/api';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}

interface ApiUsageData {
  daily: Array<{
    date: string;
    calls: number;
  }>;
  endpoints: Array<{
    path: string;
    calls: number;
    avgResponseTime: number;
  }>;
}

interface BillingData {
  currentPlan: string;
  nextBillingDate: string;
  subscriptionEndDate: string;
  apiUsage: number;
  apiLimit: number;
  recentInvoices: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

interface SubscriptionData {
  id: string;
  school_id: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  max_users: number;
  max_api_calls: number;
}

function StatCard({ title, value, icon: Icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtext && (
                <dd className="text-sm text-gray-500">{subtext}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemAdminDashboard() {
  const [apiUsage, setApiUsage] = useState<ApiUsageData | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [apiData, subsData] = await Promise.all([
          getApiUsage(),
          getSubscriptions()
        ]);

        // Ensure we only store serializable data
        setApiUsage({
          daily: apiData.daily.map(d => ({
            date: String(d.date),
            calls: Number(d.calls)
          })),
          endpoints: apiData.endpoints.map(e => ({
            path: String(e.path),
            calls: Number(e.calls),
            avgResponseTime: Number(e.avgResponseTime)
          }))
        });

        setSubscriptions(subsData.map(s => ({
          id: String(s.id),
          school_id: String(s.school_id),
          plan_name: String(s.plan_name),
          status: String(s.status),
          start_date: String(s.start_date),
          end_date: String(s.end_date),
          max_users: Number(s.max_users),
          max_api_calls: Number(s.max_api_calls)
        })));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  const activeSchools = subscriptions.filter(s => s.status === 'active').length;
  const totalApiCalls = apiUsage?.daily.reduce((sum, day) => sum + day.calls, 0) || 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Schools"
          value={activeSchools.toString()}
          icon={Building2}
          color="text-blue-500"
        />
        <StatCard
          title="Total API Calls"
          value={totalApiCalls.toLocaleString()}
          icon={Activity}
          color="text-green-500"
          subtext="Last 7 days"
        />
        <StatCard
          title="Active Subscriptions"
          value={subscriptions.length.toString()}
          icon={CreditCard}
          color="text-purple-500"
        />
        <StatCard
          title="Average Response Time"
          value="120ms"
          icon={BarChart2}
          color="text-yellow-500"
        />
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {apiUsage?.endpoints.map((endpoint, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      {endpoint.path}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {endpoint.calls.toLocaleString()} calls
                      </span>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {endpoint.avgResponseTime}ms
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchoolDashboard() {
  const { school } = useSchool();
  const [apiUsage, setApiUsage] = useState<ApiUsageData | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!school?.id) return;

      try {
        setError(null);
        const [apiData, billingData] = await Promise.all([
          getApiUsage(school.id),
          getBillingOverview(school.id)
        ]);

        // Ensure we only store serializable data
        setApiUsage({
          daily: apiData.daily.map(d => ({
            date: String(d.date),
            calls: Number(d.calls)
          })),
          endpoints: apiData.endpoints.map(e => ({
            path: String(e.path),
            calls: Number(e.calls),
            avgResponseTime: Number(e.avgResponseTime)
          }))
        });

        setBilling({
          currentPlan: String(billingData.currentPlan),
          nextBillingDate: String(billingData.nextBillingDate),
          subscriptionEndDate: String(billingData.subscriptionEndDate),
          apiUsage: Number(billingData.apiUsage),
          apiLimit: Number(billingData.apiLimit),
          recentInvoices: billingData.recentInvoices.map(invoice => ({
            id: String(invoice.id),
            amount: Number(invoice.amount),
            status: String(invoice.status),
            date: String(invoice.date)
          }))
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [school?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="156"
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Active Courses"
          value="24"
          icon={BookOpen}
          color="text-green-500"
        />
        <StatCard
          title="Total Teachers"
          value="18"
          icon={GraduationCap}
          color="text-purple-500"
        />
        <StatCard
          title="Average Grade"
          value="85%"
          icon={Award}
          color="text-yellow-500"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              API Usage
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Current Usage</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {billing?.apiUsage.toLocaleString()} / {billing?.apiLimit.toLocaleString()} calls
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {billing?.currentPlan}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Invoices
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {billing?.recentInvoices.map((invoice) => (
                <li key={invoice.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900">
                      ${invoice.amount.toFixed(2)}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'system_admin' ? <SystemAdminDashboard /> : <SchoolDashboard />;
}