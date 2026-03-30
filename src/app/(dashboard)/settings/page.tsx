'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GradientText } from '@/components/animations/gradient-text'
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarker, 
  FaLock, 
  FaBell,
  FaPalette,
  FaGlobe,
  FaMoon,
  FaSun,
  FaEdit,
  FaTrash,
  FaClock
} from 'react-icons/fa'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: Date
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault: boolean
  addressType: 'shipping' | 'billing' | 'both'
}

interface NotificationPreferences {
  email: {
    orderConfirmation: boolean
    shippingUpdate: boolean
    deliveryConfirmation: boolean
    promotions: boolean
    newsletter: boolean
  }
  push: {
    orderUpdates: boolean
    promotions: boolean
  }
}

interface SettingsState {
  profile: UserProfile | null
  addresses: Address[]
  notifications: NotificationPreferences
  theme: 'light' | 'dark' | 'system'
  language: string
  currency: string
}

export default function SettingsPage() {
  const { user, isInitialized } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'notifications' | 'preferences' | 'security'>('profile')
  const [editMode, setEditMode] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    profile: null,
    addresses: [],
    notifications: {
      email: {
        orderConfirmation: true,
        shippingUpdate: true,
        deliveryConfirmation: true,
        promotions: false,
        newsletter: false,
      },
      push: {
        orderUpdates: true,
        promotions: false,
      },
    },
    theme: 'system',
    language: 'en',
    currency: 'USD',
  })

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  // Address form state
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false,
    addressType: 'both' as 'shipping' | 'billing' | 'both',
  })

  // Load user data
  useEffect(() => {
    if (isInitialized && user) {
      loadUserData()
    }
  }, [user, isInitialized])

  const loadUserData = async () => {
    try {
      // Load profile
      const profileResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const profileData = await profileResponse.json()
      
      if (profileResponse.ok) {
        setSettings(prev => ({ ...prev, profile: profileData }))
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
        })
      }
      
      // Load addresses
      const addressesResponse = await fetch('/api/user/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const addressesData = await addressesResponse.json()
      
      if (addressesResponse.ok) {
        setSettings(prev => ({ ...prev, addresses: addressesData.data || [] }))
      }
      
      // Load preferences
      const prefsResponse = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const prefsData = await prefsResponse.json()
      
      if (prefsResponse.ok) {
        setSettings(prev => ({
          ...prev,
          theme: prefsData.theme || 'system',
          language: prefsData.language || 'en',
          currency: prefsData.currency || 'USD',
          notifications: prefsData.notifications || prev.notifications,
        }))
      }
      
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!profileForm.name.trim()) {
      errors.name = 'Name is required'
    } else if (profileForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Invalid email address'
    }
    
    if (profileForm.phone && !/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/.test(profileForm.phone)) {
      errors.phone = 'Invalid phone number'
    }
    
    setProfileErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileUpdate = async () => {
    if (!validateProfile()) {
      toast.error('Please fix the errors')
      return
    }
    
    setSaving(true)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileForm),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Profile updated successfully')
        setEditMode(false)
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, ...profileForm } as UserProfile,
        }))
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase and number'
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      toast.error('Please fix the errors')
      return
    }
    
    setSaving(true)
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        throw new Error(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressSubmit = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.country || !addressForm.postalCode) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setSaving(true)
    
    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}` 
        : '/api/user/addresses'
      
      const response = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(addressForm),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(editingAddress ? 'Address updated' : 'Address added')
        await loadUserData()
        setShowAddressModal(false)
        setEditingAddress(null)
        setAddressForm({
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          isDefault: false,
          addressType: 'both',
        })
      } else {
        throw new Error(data.error || 'Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (response.ok) {
        toast.success('Address deleted')
        await loadUserData()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  type PreferenceValue = string | NotificationPreferences | { email: Record<string, boolean>; push: Record<string, boolean> }

  const handlePreferenceUpdate = async (key: string, value: PreferenceValue) => {
    setSaving(true)
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ [key]: value }),
      })
      
      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }))
        toast.success('Preferences updated')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'addresses', label: 'Addresses', icon: FaMapMarker },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'preferences', label: 'Preferences', icon: FaPalette },
    { id: 'security', label: 'Security', icon: FaLock },
  ]

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <GradientText gradient="primary" size="2xl" weight="bold">
            Account Settings
          </GradientText>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
              {!editMode && (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <FaEdit className="mr-2" /> Edit Profile
                </Button>
              )}
            </div>
            
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    error={profileErrors.name}
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    error={profileErrors.email}
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    error={profileErrors.phone}
                    disabled={saving}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleProfileUpdate} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaUser className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{settings.profile?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{settings.profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{settings.profile?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaClock className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {settings.profile?.createdAt 
                        ? new Date(settings.profile.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
              <Button onClick={() => setShowAddressModal(true)}>
                Add New Address
              </Button>
            </div>
            
            {settings.addresses.length === 0 ? (
              <div className="text-center py-12">
                <FaMapMarker className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Addresses Yet</h3>
                <p className="text-gray-500 mb-6">Add your first address for faster checkout</p>
                <Button onClick={() => setShowAddressModal(true)}>Add Address</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        {address.isDefault && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                            Default
                          </span>
                        )}
                        <p className="font-medium">{address.street}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {address.addressType === 'both' ? 'Shipping & Billing' : address.addressType}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAddress(address)
                            setAddressForm({
                              street: address.street,
                              city: address.city,
                              state: address.state,
                              country: address.country,
                              postalCode: address.postalCode,
                              isDefault: address.isDefault,
                              addressType: address.addressType,
                            })
                            setShowAddressModal(true)
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleAddressDelete(address.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(settings.notifications.email).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-600">
                        {key === 'orderConfirmation' && 'Order Confirmation'}
                        {key === 'shippingUpdate' && 'Shipping Updates'}
                        {key === 'deliveryConfirmation' && 'Delivery Confirmation'}
                        {key === 'promotions' && 'Promotions & Offers'}
                        {key === 'newsletter' && 'Newsletter'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handlePreferenceUpdate('notifications', {
                          ...settings.notifications,
                          email: { ...settings.notifications.email, [key]: e.target.checked }
                        })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Push Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(settings.notifications.push).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-600">
                        {key === 'orderUpdates' && 'Order Updates'}
                        {key === 'promotions' && 'Promotions'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handlePreferenceUpdate('notifications', {
                          ...settings.notifications,
                          push: { ...settings.notifications.push, [key]: e.target.checked }
                        })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Display Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="flex gap-4">
                  {['light', 'dark', 'system'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handlePreferenceUpdate('theme', theme)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition ${
                        settings.theme === theme
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {theme === 'light' && <FaSun className="inline mr-2" />}
                      {theme === 'dark' && <FaMoon className="inline mr-2" />}
                      {theme === 'system' && <FaGlobe className="inline mr-2" />}
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handlePreferenceUpdate('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handlePreferenceUpdate('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      error={passwordErrors.currentPassword}
                      disabled={saving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      error={passwordErrors.newPassword}
                      disabled={saving}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      At least 8 characters with uppercase, lowercase and numbers
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      error={passwordErrors.confirmPassword}
                      disabled={saving}
                    />
                  </div>
                  
                  <Button onClick={handlePasswordChange} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-700 mb-4">Session Management</h3>
                <Button variant="outline" className="text-red-600">
                  <FaTrash className="mr-2" />
                  Logout from All Devices
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <h3 className="text-xl font-bold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City *"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Country *"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code *"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="mr-2"
                    />
                    Set as default address
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Type</label>
                  <select
                    value={addressForm.addressType}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="both">Shipping & Billing</option>
                    <option value="shipping">Shipping Only</option>
                    <option value="billing">Billing Only</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddressSubmit} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : (editingAddress ? 'Update' : 'Add')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddressModal(false)
                    setEditingAddress(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}