'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Loader2, Clock, CheckCircle, XCircle, ArrowLeft, ChevronDown, ChevronUp, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';

interface Video {
  title?: string;
  url?: string;
  channel?: string;
  thumbnail?: string;
}

interface Job {
  id: number;
  durasi: number;
  durasi_aktual: number | null;
  status: string;
  videos_json: Video[] | null;
  videos_count: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export default function HistoryContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const fetchHistory = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/jobs/history?page=${page}`);
      setJobs(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch history';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Auto-refresh if there are processing/pending jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(j => j.status === 'processing' || j.status === 'pending');
    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      fetchHistory(pagination?.current_page || 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [jobs, pagination, fetchHistory]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    } finally {
      logout();
      router.push('/login');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  const toggleExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Job History</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchHistory(pagination?.current_page || 1)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading history...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found</p>
              <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
                Submit your first job
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Videos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <>
                        <tr key={job.id} className={expandedJobId === job.id ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#{job.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.durasi}s {job.durasi_aktual && <span className="text-gray-400">({job.durasi_aktual}s actual)</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(job.status)}
                              <span className={getStatusBadge(job.status)}>{job.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.videos_count > 0 ? (
                              <span className="text-green-600 font-medium">{job.videos_count} videos</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-500 max-w-[200px] truncate">
                            {job.error_message || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => toggleExpand(job.id)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {expandedJobId === job.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Detail
                            </button>
                          </td>
                        </tr>
                        {expandedJobId === job.id && (
                          <tr key={`${job.id}-detail`}>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-3">
                                {/* Status Log */}
                                <div className="text-sm">
                                  <h4 className="font-semibold text-gray-700 mb-2">Status Log</h4>
                                  <div className="bg-white p-3 rounded border text-xs font-mono space-y-1">
                                    <p>Created: {new Date(job.created_at).toLocaleString()}</p>
                                    <p>Duration: {job.durasi}s requested{job.durasi_aktual ? `, ${job.durasi_aktual}s actual` : ''}</p>
                                    <p>Status: {job.status}</p>
                                    {job.completed_at && <p>Completed: {new Date(job.completed_at).toLocaleString()}</p>}
                                    {job.error_message && <p className="text-red-600">Error: {job.error_message}</p>}
                                  </div>
                                </div>

                                {/* Videos List */}
                                {job.videos_json && job.videos_json.length > 0 ? (
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-gray-700 mb-2">Collected Videos ({job.videos_json.length})</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {job.videos_json.map((video, idx) => (
                                          <div key={idx} className="bg-white p-3 rounded border hover:shadow-md transition-shadow">
                                            <div className="flex gap-3">
                                              {video.thumbnail && (
                                                <img
                                                  src={video.thumbnail}
                                                  alt={video.title || 'Video thumbnail'}
                                                  className="w-20 h-12 object-cover rounded flex-shrink-0"
                                                />
                                              )}
                                              <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={video.title}>
                                                  {video.title || 'Untitled'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate" title={video.channel || ''}>
                                                  {video.channel || 'Unknown channel'}
                                                </p>
                                                {video.url && (
                                                  <a
                                                    href={video.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                                                  >
                                                    Watch <ExternalLink className="w-3 h-3" />
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-700 mb-2">Raw JSON Data</h4>
                                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                                        {JSON.stringify(job.videos_json, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                ) : job.status === 'completed' ? (
                                  <p className="text-sm text-gray-500 italic">No videos collected</p>
                                ) : job.status === 'processing' ? (
                                  <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing... waiting for results
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchHistory(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchHistory(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
