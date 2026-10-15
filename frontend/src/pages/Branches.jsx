import React, { useState, useEffect } from "react";
import {
    TextField,
    SelectField,
    Button,
} from "../components/DataFields";
import { Table } from "../components/Tables";
import { ActionMenu } from "../components/ActionMenu";
import { Dialog } from "../components/Popups";
import { Chip } from "../components/Chip";
import api from "../axiosClient";

export const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        code: "",
        name: "",
        slug: "",
        phone: "",
        city: "",
        address_line1: "",
        email: "",
        branch_type: "restaurant",
        status: "active",
    });

    const [fieldErrors, setFieldErrors] = useState({});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const branchTypeOptions = [
        { value: "restaurant", label: "Restaurant" },
        { value: "cafe", label: "Cafe" },
        { value: "hotel", label: "Hotel" },
        { value: "resort", label: "Resort" },
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    const fetchBranches = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/branches?per_page=100");
            const raw = response.data?.data;
            const list = Array.isArray(raw) ? raw : raw?.data || [];

            const formatted = list.map((branch) => ({
                id: branch.id,
                code: branch.code || "N/A",
                name: branch.name || "N/A",
                city: branch.city || "N/A",
                phone: branch.phone || "N/A",
                branch_type: branch.branch_type
                    ? branch.branch_type.charAt(0).toUpperCase() + branch.branch_type.slice(1)
                    : "Restaurant",
                status: branch.status || "active",
                statusChip: <Chip status={branch.status || "active"} size="small" />,
                raw: branch,
            }));

            setBranches(formatted);
        } catch (error) {
            console.error("Failed to fetch branches:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const columns = [
        { key: "code", label: "Branch Code", sortable: true },
        { key: "name", label: "Branch Name", sortable: true },
        { key: "city", label: "City", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "branch_type", label: "Type" },
        { key: "statusChip", label: "Status" },
    ];

    const handleOpenEdit = (row) => {
        const branch = row.raw || row;
        setIsEditMode(true);
        setFormData({
            id: branch.id,
            code: branch.code || "",
            name: branch.name || "",
            slug: branch.slug || "",
            phone: branch.phone || "",
            city: branch.city || "",
            address_line1: branch.address_line1 || "",
            email: branch.email || "",
            branch_type: branch.branch_type || "restaurant",
            status: (branch.status || "active").toLowerCase(),
        });
        setFieldErrors({});
        setShowModal(true);
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setFormData({
            id: null,
            code: "",
            name: "",
            slug: "",
            phone: "",
            city: "",
            address_line1: "",
            email: "",
            branch_type: "restaurant",
            status: "active",
        });
        setFieldErrors({});
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setFormData({
            id: null,
            code: "",
            name: "",
            slug: "",
            phone: "",
            city: "",
            address_line1: "",
            email: "",
            branch_type: "restaurant",
            status: "active",
        });
        setFieldErrors({});
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.code.trim()) errors.code = "Branch code is required.";
        if (!formData.name.trim()) errors.name = "Branch name is required.";
        if (!formData.city.trim()) errors.city = "City is required.";
        if (!formData.address_line1.trim()) errors.address_line1 = "Address line 1 is required.";
        if (!formData.phone.trim()) errors.phone = "Phone number is required.";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitBranch = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                code: formData.code.trim(),
                name: formData.name.trim(),
                slug: formData.slug?.trim() || generateSlug(formData.name),
                address_line1: formData.address_line1.trim(),
                city: formData.city.trim(),
                phone: formData.phone.trim(),
                email: formData.email?.trim() || null,
                branch_type: formData.branch_type || "restaurant",
                status: formData.status || "active",
            };

            if (isEditMode) {
                await api.put(`/branches/${formData.id}`, payload);
            } else {
                await api.post("/branches", payload);
            }

            handleCloseModal();
            fetchBranches();
        } catch (error) {
            console.error("Save branch failed:", error);
            if (error.response?.data?.errors) {
                setFieldErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDelete = (row) => {
        setBranchToDelete(row.raw || row);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!branchToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/branches/${branchToDelete.id}`);
            setShowDeleteModal(false);
            setBranchToDelete(null);
            fetchBranches();
        } catch (error) {
            console.error("Delete branch failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F7F8F8]">
                        Branches
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-[#8A8F98]">
                        Manage restaurant locations and branch profiles.
                    </p>
                </div>

                <Button variant="primary" onClick={handleOpenAdd}>
                    Add Branch
                </Button>
            </div>

            {/* Table Component */}
            <Table
                columns={columns}
                data={branches}
                loading={isLoading}
                selectable={false}
                expandable={false}
                searchable={false}
                filterable={false}
                pagination={true}
                actionsAlign="right"
                showActionsHeader={false}
                actions={(row) => [
                    {
                        label: "Branch actions",
                        render: () => (
                            <ActionMenu
                                label={`Actions for ${row.name}`}
                                items={[
                                    { label: "Edit branch", onClick: () => handleOpenEdit(row) },
                                    {
                                        label: "Delete branch",
                                        variant: "danger",
                                        onClick: () => handleOpenDelete(row),
                                    },
                                ]}
                            />
                        ),
                    },
                ]}
            />

            {/* Add / Edit Dialog */}
            <Dialog
                isOpen={showModal}
                onClose={handleCloseModal}
                title={isEditMode ? "Edit Branch" : "Add Branch"}
                size="medium"
                primaryButtonText={isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
                secondaryButtonText="Cancel"
                primaryButtonDisabled={isSubmitting}
                secondaryButtonDisabled={isSubmitting}
                onPrimaryButtonClick={handleSubmitBranch}
                onSecondaryButtonClick={handleCloseModal}
            >
                <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
                    <TextField
                        label="Branch Code"
                        required
                        fullWidth
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        error={!!fieldErrors.code}
                        helperText={fieldErrors.code}
                    />

                    <TextField
                        label="Branch Name"
                        required
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                    />

                    <TextField
                        label="Phone Number"
                        required
                        fullWidth
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        error={!!fieldErrors.phone}
                        helperText={fieldErrors.phone}
                    />

                    <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email}
                    />

                    <TextField
                        label="City"
                        required
                        fullWidth
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        error={!!fieldErrors.city}
                        helperText={fieldErrors.city}
                    />

                    <SelectField
                        label="Branch Type"
                        fullWidth
                        value={formData.branch_type}
                        options={branchTypeOptions}
                        onChange={(e) => setFormData({ ...formData, branch_type: e.target.value })}
                    />

                    <div className="sm:col-span-2">
                        <TextField
                            label="Address Line 1"
                            required
                            fullWidth
                            value={formData.address_line1}
                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            error={!!fieldErrors.address_line1}
                            helperText={fieldErrors.address_line1}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <SelectField
                            label="Status"
                            fullWidth
                            value={formData.status}
                            options={statusOptions}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Branch"
                size="small"
                primaryButtonText={isDeleting ? "Deleting..." : "Delete"}
                secondaryButtonText="Cancel"
                primaryButtonDisabled={isDeleting}
                onPrimaryButtonClick={handleConfirmDelete}
                onSecondaryButtonClick={() => setShowDeleteModal(false)}
            >
                <p className="text-sm text-slate-600 dark:text-[#D0D6E0] py-2">
                    Are you sure you want to delete the branch{" "}
                    <strong className="text-slate-900 dark:text-white">"{branchToDelete?.name}"</strong>?
                    This action cannot be undone.
                </p>
            </Dialog>
        </div>
    );
};

export default Branches;
