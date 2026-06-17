import React, { useState, useMemo } from "react";
import {
  SelectField,
  TextField,
  NumberField,
  CheckboxField,
  RadioField,
  Button,
  TextAreaField,
  ToggleSwitch,
  ImageUploadField,
  CategoryTreeField,
  PhoneField,
} from "../components/DataFields";
import { Table } from "../components/Tables";
import { Accordion } from "../components/Accordion";
import { Alert, Dialog, Snackbar, Loading, Drawer } from "../components/Popups";
import { SectionDivider, VerticalTabs } from "../components/SectionDivider";
import { Stepper } from "../components/Stepper";
import { AddItem } from "../components/AddItem";

export const Users = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [phone, setphone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleOption, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Waiter",
    status: "Active",
  });

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "cashier", label: "Cashier" },
    { value: "waiter", label: "Waiter" },
    { value: "kitchen_staff", label: "Kitchen Staff" },
  ];

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status,
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
      username:
        formData.username || formData.name.toLowerCase().replace(/\s+/g, ""),
      email: formData.email,
      role: formData.role,
      status: formData.status,
      lastLogin: "Just now",
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 70)}.jpg`,
    };

    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id
        ? {
            ...user,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            status: formData.status,
          }
        : user,
    );

    setUsers(updatedUsers);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Waiter",
      status: "Active",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setroleOption("All");
    setStatusFilter("All");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Users
        </h1>

        <Button
          variant="primary"
          onClick={() => setShowAddUser(true)}
          startIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          Add User
        </Button>
        <Dialog
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          title="Add User"
          size="medium"
          onSubmit={() => {
            console.log("Submitted");
            setShowAddUser(false);
          }}
          onCancel={() => setShowAddUser(false)}
        >
          <ImageUploadField
            label="Profile Image"
            value={uploadedImage}
            onChange={setUploadedImage}
            helperText="Upload a profile image (JPG, PNG)"
            accept="image/*"
            variant="outlined"
            fullWidth
          />
          <div className="flex flex-col mb-4 pt-4">
            <TextField
              label="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-4 width-full pb-4">
            <TextField
              fullWidth={true}
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth={true}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-row gap-4 width-full pb-4">
            <PhoneField
              label="Phone Number"
              value={phone}
              onChange={setphone}
              fullWidth
              helperText="Default country: LK (+94)"
            />

            <PhoneField
              label="whatsapp Number"
              value={whatsapp}
              onChange={setWhatsapp}
              fullWidth
              helperText="Default country: LK (+94)"
            />
          </div>
        </Dialog>
      </div>

      <div className="max-w-7xl">
        {/* Search & Filters */}

        {/* Users Table */}
        <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-5 px-8 font-medium text-gray-400">
                    Staff
                  </th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">
                    Email
                  </th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">
                    Role
                  </th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-5 px-6 font-medium text-gray-400">
                    Last Login
                  </th>
                  <th className="text-right py-5 px-8 font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-800/50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <img className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gray-700" />
                      <div>
                        <div className="text-sm text-gray-500"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-gray-300"></td>
                  <td className="py-5 px-6">
                    <span className="inline-block px-4 py-1 bg-gray-800 rounded-full text-sm"></span>
                  </td>
                  <td className="py-5 px-6"></td>
                  <td className="py-5 px-6 text-gray-400 text-sm"></td>
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
                : (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
                )
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
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
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
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
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
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
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {selectedUser.name}
              </span>
              ? This action cannot be undone.
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
