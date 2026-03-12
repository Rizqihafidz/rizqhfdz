'use client'

import { useState } from 'react'
import MaterialIcon from '@/components/ui/MaterialIcon'
import PasswordInput from '@/components/ui/PasswordInput'

const inputClass =
  'w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
const sectionClass =
  'p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4'

export default function SettingsPage() {
  // Change Email state
  const [emailPassword, setEmailPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Change Password state
  const [passCurrentPassword, setPassCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChangeEmail = async () => {
    setEmailMessage(null)

    if (!emailPassword.trim()) {
      setEmailMessage({ type: 'error', text: 'Current password is required.' })
      return
    }
    if (!newEmail.trim()) {
      setEmailMessage({ type: 'error', text: 'New email is required.' })
      return
    }

    setEmailLoading(true)
    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: emailPassword, newEmail }),
      })

      if (res.ok) {
        setEmailMessage({ type: 'success', text: 'Email updated successfully!' })
        setEmailPassword('')
        setNewEmail('')
      } else {
        const data = await res.json()
        setEmailMessage({ type: 'error', text: data.error || 'Failed to update email.' })
      }
    } catch {
      setEmailMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPassMessage(null)

    if (!passCurrentPassword.trim()) {
      setPassMessage({ type: 'error', text: 'Current password is required.' })
      return
    }
    if (!newPassword.trim()) {
      setPassMessage({ type: 'error', text: 'New password is required.' })
      return
    }
    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPassLoading(true)
    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passCurrentPassword, newPassword }),
      })

      if (res.ok) {
        setPassMessage({ type: 'success', text: 'Password updated successfully!' })
        setPassCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await res.json()
        setPassMessage({ type: 'error', text: data.error || 'Failed to update password.' })
      }
    } catch {
      setPassMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account email and password.
        </p>
      </div>

      {/* Change Email */}
      <form className={sectionClass} onSubmit={(e) => { e.preventDefault(); handleChangeEmail() }}>
        <h2 className="text-lg font-bold">Change Email</h2>
        <div>
          <label htmlFor="settings-email-password" className="block text-sm font-medium mb-1">Current Password</label>
          <PasswordInput
            id="settings-email-password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            placeholder="Enter current password"
            disabled={emailLoading}
          />
        </div>
        <div>
          <label htmlFor="settings-new-email" className="block text-sm font-medium mb-1">New Email</label>
          <input
            id="settings-new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
            className={inputClass}
            disabled={emailLoading}
          />
        </div>
        {emailMessage && (
          <p className={`text-sm font-medium ${emailMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {emailMessage.text}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={emailLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MaterialIcon name="mail" className="text-lg" />
            {emailLoading ? 'Updating...' : 'Update Email'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form className={sectionClass} onSubmit={(e) => { e.preventDefault(); handleChangePassword() }}>
        <h2 className="text-lg font-bold">Change Password</h2>
        <div>
          <label htmlFor="settings-current-password" className="block text-sm font-medium mb-1">Current Password</label>
          <PasswordInput
            id="settings-current-password"
            value={passCurrentPassword}
            onChange={(e) => setPassCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            disabled={passLoading}
          />
        </div>
        <div>
          <label htmlFor="settings-new-password" className="block text-sm font-medium mb-1">New Password</label>
          <PasswordInput
            id="settings-new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            disabled={passLoading}
          />
        </div>
        <div>
          <label htmlFor="settings-confirm-password" className="block text-sm font-medium mb-1">Confirm New Password</label>
          <PasswordInput
            id="settings-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            disabled={passLoading}
          />
        </div>
        {passMessage && (
          <p className={`text-sm font-medium ${passMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {passMessage.text}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MaterialIcon name="lock" className="text-lg" />
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
