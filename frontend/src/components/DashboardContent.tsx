'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface JobResponse {
  job_id: number;
  status: string;
}

interface Job {
  id: number;
  status: string;
}

interface Stats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export default function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [durasi, setDurasi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ pending: 0, processing: 0, completed: 0, failed: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/jobs/history');
      const jobs: Job[] = response.data.data;
      setStats({
        pending: jobs.filter((j: Job) => j.status === 'pending').length,
        processing: jobs.filter((j: Job) => j.status === 'processing').length,
        completed: jobs.filter((j: Job) => j.status === 'completed').length,
        failed: jobs.filter((j: Job) => j.status === 'failed').length,
      });
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmitResult(null);

    try {
      const response = await api.post('/jobs', { durasi: parseInt(durasi) });
      setSubmitResult(response.data.data);
      setDurasi('');
      fetchStats();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit job';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Automation Get Data</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Scroll Job</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="durasi" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    id="durasi"
                    type="number"
                    min="1"
                    max="300"
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="60"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">1-300 seconds (5 minutes max)</p>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {submitResult && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Job submitted! Job ID: {submitResult.job_id}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Job'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Pending Jobs</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <div>
                    <p className="text-sm text-gray-500">Processing</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.processing}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Completed Jobs</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Failed Jobs</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.failed}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/history"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
            >
              View Job History →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
