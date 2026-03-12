'use client'

import Link from 'next/link'
import { useAdminData } from '@/context/AdminDataContext'
import { getTypeBadgeClass } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'

export default function AdminDashboard() {
  const { projects } = useAdminData()

  const gameCount = projects.filter((p) => p.type === 'game').length
  const webCount = projects.filter((p) => p.type === 'web').length

  const stats = [
    { icon: 'folder', label: 'Total Projects', value: projects.length, color: 'text-primary' },
    { icon: 'sports_esports', label: 'Game Projects', value: gameCount, color: 'text-red-500' },
    { icon: 'web', label: 'Web Projects', value: webCount, color: 'text-emerald-500' },
    { icon: 'check_circle', label: 'Profile Status', value: 'Complete', color: 'text-primary' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-black mb-2">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Welcome back! Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm"
          >
            <MaterialIcon name={stat.icon} className={`text-3xl ${stat.color} mb-3 block`} />
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
        >
          <MaterialIcon name="add" className="text-xl" />
          Add New Project
        </Link>
        <Link
          href="/admin/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-sm"
        >
          <MaterialIcon name="edit" className="text-xl" />
          Edit Profile
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-sm"
        >
          <MaterialIcon name="open_in_new" className="text-xl" />
          View Site
        </Link>
      </div>

      {/* Recent Projects */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent Projects</h2>
        {projects.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-4">
            No projects yet. Create your first project!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {projects.slice(-5).reverse().map((project) => (
              <div key={project.slug} className="flex items-center gap-4 py-3">
                <img
                  src={project.cardImage}
                  alt={project.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getTypeBadgeClass(project.type, 'inline')}`}
                    >
                      {project.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          project.metadata.statusColor === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                      {project.metadata.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/projects/${project.slug}/edit`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <MaterialIcon name="edit" className="text-xl" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
