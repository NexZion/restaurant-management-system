import React, { useState, useMemo } from 'react';
import { SelectField, TextField, Button, TextAreaField, ToggleSwitch, ImageUploadField, CategoryTreeField, PhoneField } from "../components/DataFields"

const mockUsers = [
  {
    id: 1,
    name: "Sarah Chen",
    username: "sarahc",
    email: "sarah.chen@aurarestaurant.com",
    role: "Administrator",
    status: "Active",
    lastLogin: "2026-06-16 09:45",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    username: "marcusr",
    email: "marcus.r@aurarestaurant.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-06-17 08:12",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 3,
    name: "Aisha Patel",
    username: "aishap",
    email: "aisha.patel@aurarestaurant.com",
    role: "Cashier",
    status: "Active",
    lastLogin: "2026-06-16 22:30",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    id: 4,
    name: "David Kim",
    username: "davidk",
    email: "david.kim@aurarestaurant.com",
    role: "Waiter",
    status: "Inactive",
    lastLogin: "2026-06-10 14:20",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    id: 5,
    name: "Elena Morales",
    username: "elenam",
    email: "elena.m@aurarestaurant.com",
    role: "Kitchen Staff",
    status: "Active",
    lastLogin: "2026-06-17 07:55",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg"
  },
];

export const Users = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '', role: 'Waiter', status: 'Active'
  });

  const roles = ['Administrator', 'Manager', 'Cashier', 'Waiter', 'Kitchen Staff'];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
    admins: users.filter(u => u.role === 'Administrator').length,
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.password) return;
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: formData.name,
      username: formData.username || formData.name.toLowerCase().replace(/\s+/g, ''),
      email: formData.email,
      role: formData.role,
      status: formData.status,
      lastLogin: "Just now",
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 70)}.jpg`
    };

    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            status: formData.status 
          } 
        : user
    );

    setUsers(updatedUsers);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      name: '', username: '', email: '', password: '', confirmPassword: '', role: 'Waiter', status: 'Active'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Users</h1>
            <p className="text-gray-400 mt-1">Manage restaurant staff accounts</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <span className="text-xl leading-none">+</span>
            Add User
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors">
            <div className="text-emerald-400 text-sm font-medium">TOTAL USERS</div>
            <div className="text-5xl font-bold mt-4">{stats.total}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors">
            <div className="text-emerald-400 text-sm font-medium">ACTIVE USERS</div>
            <div className="text-5xl font-bold mt-4 text-emerald-400">{stats.active}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors">
            <div className="text-emerald-400 text-sm font-medium">INACTIVE USERS</div>
            <div className="text-5xl font-bold mt-4 text-amber-400">{stats.inactive}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors">
            <div className="text-emerald-400 text-sm font-medium">ADMINISTRATORS</div>
            <div className="text-5xl font-bold mt-4">{stats.admins}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="All">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-6 py-3 border border-gray-700 hover:bg-gray-800 rounded-2xl transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-5 px-8 font-medium text-gray-400">Staff</th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">Email</th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">Role</th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">Status</th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">Last Login</th>
                  <th className="text-right py-5 px-8 font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gray-700"
                          />
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-gray-300">{user.email}</td>
                      <td className="py-5 px-6">
                        <span className="inline-block px-4 py-1 bg-gray-800 rounded-full text-sm">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium
                          ${user.status === 'Active' 
                            ? 'bg-emerald-900/50 text-emerald-400' 
                            : 'bg-gray-700 text-gray-400'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-gray-400 text-sm">{user.lastLogin}</td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-2xl text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => openDeleteModal(user)}
                            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-2xl text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-gray-500">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg">
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Add New User</h2>
              <div className="space-y-5">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 p-5 flex gap-3">
              <button 
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUser}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-medium transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg">
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Edit User</h2>
              <div className="space-y-5">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 p-5 flex gap-3">
              <button 
                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditUser}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🗑️</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Delete User?</h3>
            <p className="text-gray-400 mb-8">
              Are you sure you want to delete <span className="font-medium text-white">{selectedUser.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-medium transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;