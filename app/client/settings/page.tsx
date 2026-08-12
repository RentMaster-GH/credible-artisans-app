'use client';

import React, { useState } from 'react';

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: 'Soul Real',
    email: 'client@credibleartisans.com',
    phone: '+234 800 000 0000',
    address: '12 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    // Call your Next.js API route (/api/client/settings)
    try {
      const res = await fetch('/api/client/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Settings updated successfully!');
      } else {
        setMessage('Failed to update settings.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">⚙️ Client Account Settings</h1>
      <p className="text-gray-600 mb-6">Manage your project preferences, profile, and security settings.</p>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            👤 Profile & Location
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'security' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            🔐 Security & Password
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'billing' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            💳 Billing & Payments
          </button>
        </aside>

        {/* Form Details Area */}
        <main className="md:col-span-3 bg-white p-6 border rounded-xl shadow-sm">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Profile Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 w-full border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold border-b pt-4 pb-2">Default Site Address</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 w-full border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Update Password</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" className="mt-1 w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" className="mt-1 w-full border p-2 rounded-lg" />
              </div>
              <button className="bg-black text-white px-6 py-2 rounded-lg">
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Notification Preferences</h2>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Receive email alerts when artisans apply to your jobs</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Receive SMS notifications for project milestone updates</span>
              </label>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-xl font-bold border-b pb-2">Payment Methods & Billing</h2>
              <p className="text-gray-600 text-sm my-4">
                Manage your stored cards and view escrow payments made to artisans on credibleartisans.com.
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                + Add Payment Method
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}