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

const [school, setSchool] = useState({ id: '' }); // Define school state variable

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

async function loadData() {
  try {
    setError(null);
    const [apiData, subsData] = await Promise.all([
      getApiUsage(school.id), // Use school state variable
      getSubscriptions(school.id) // Use school state variable
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

export default Dashboard;