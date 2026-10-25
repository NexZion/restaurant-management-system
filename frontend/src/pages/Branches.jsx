import React, { useState, useEffect } from "react";
import {
    TextField,
    SelectField,
    Button,
    PhoneField,
    CheckboxField,
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

    const initialFormData = {
        id: null,
        code: "",
        name: "",
        slug: "",
        phone: "",
        email: "",
        whatsapp: "",
        manager_name: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "Sri Lanka",
        branch_type: "restaurant",
        has_dining: true,
        has_delivery: true,
        has_rooms: false,
        opening_time: "08:00",
        closing_time: "22:00",
        status: "active",
    };

    const [formData, setFormData] = useState(initialFormData);
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
                statusChip: <Chip status={branch.status || "active"}
                    tone={branch.status?.toLowerCase() === "inactive" ? "red" : undefined}
                    size="small" />,
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
            email: branch.email || "",
            whatsapp: branch.whatsapp || "",
            manager_name: branch.manager_name || "",
            address_line1: branch.address_line1 || "",
            address_line2: branch.address_line2 || "",
            city: branch.city || "",
            state_province: branch.state_province || "",
            postal_code: branch.postal_code || "",
            country: branch.country || "Sri Lanka",
            branch_type: branch.branch_type || "restaurant",
            has_dining: Boolean(branch.has_dining),
            has_delivery: Boolean(branch.has_delivery),
            has_rooms: Boolean(branch.has_rooms),
            opening_time: branch.opening_time ? branch.opening_time.slice(0, 5) : "08:00",
            closing_time: branch.closing_time ? branch.closing_time.slice(0, 5) : "22:00",
            status: (branch.status || "active").toLowerCase(),
        });
        setFieldErrors({});
        setShowModal(true);
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setFormData(initialFormData);
        setFieldErrors({});
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setFormData(initialFormData);
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

        // 1. Required field checks
        if (!formData.code?.trim()) errors.code = "Branch code is required.";
        if (!formData.name?.trim()) errors.name = "Branch name is required.";
        if (!formData.city?.trim()) errors.city = "City is required.";
        if (!formData.address_line1?.trim()) errors.address_line1 = "Address line 1 is required.";
        if (!formData.phone?.trim()) errors.phone = "Phone number is required.";


        if (formData.code?.trim()) {
            const enteredCode = formData.code.trim().toLowerCase();
            const codeExists = branches.some(
                (b) => String(b.id) !== String(formData.id) && String(b.code).toLowerCase() === enteredCode
            );
            if (codeExists) {
                errors.code = "This branch code is already in use by another branch.";
            }
        }

        // 3. Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email?.trim() && !emailRegex.test(formData.email.trim())) {
            errors.email = "Please enter a valid email address.";
        }

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
                phone: formData.phone.trim(),
                email: formData.email?.trim() || null,
                whatsapp: formData.whatsapp?.trim() || null,
                manager_name: formData.manager_name?.trim() || null,
                address_line1: formData.address_line1.trim(),
                address_line2: formData.address_line2?.trim() || null,
                city: formData.city.trim(),
                state_province: formData.state_province?.trim() || null,
                postal_code: formData.postal_code?.trim() || null,
                country: formData.country?.trim() || "Sri Lanka",
                branch_type: formData.branch_type || "restaurant",
                has_dining: formData.has_dining ? 1 : 0,
                has_delivery: formData.has_delivery ? 1 : 0,
                has_rooms: formData.has_rooms ? 1 : 0,
                opening_time: formData.opening_time || null,
                closing_time: formData.closing_time || null,
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
                        Manage restaurant locations, facilities, and branch profiles.
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
                size="large"
                primaryButtonText={isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
                secondaryButtonText="Cancel"
                primaryButtonDisabled={isSubmitting}
                secondaryButtonDisabled={isSubmitting}
                onPrimaryButtonClick={handleSubmitBranch}
                onSecondaryButtonClick={handleCloseModal}
            >
                <div className="flex flex-col gap-6 py-2 max-h-[72vh] overflow-y-auto px-1 pr-2">
                    {/* Section 1: Basic Information */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8A8F98] mb-3">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextField
                                label="Branch Code"
                                required
                                fullWidth
                                floatLabel={true}
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                error={!!fieldErrors.code}
                                helperText={fieldErrors.code}
                                placeholder="e.g. BR-001"
                            />

                            <TextField
                                label="Branch Name"
                                required
                                fullWidth
                                floatLabel={true}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!fieldErrors.name}
                                helperText={fieldErrors.name}
                                placeholder="e.g. Colombo Central"
                            />

                            <SelectField
                                label="Branch Type"
                                fullWidth
                                value={formData.branch_type}
                                options={branchTypeOptions}
                                onChange={(e) => setFormData({ ...formData, branch_type: e.target.value })}
                            />

                            <SelectField
                                label="Status"
                                fullWidth
                                value={formData.status}
                                options={statusOptions}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Section 2: Contact Details */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8A8F98] mb-3">
                            Contact Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <PhoneField
                                label="Primary Phone"
                                required
                                fullWidth
                                defaultCode="+94"
                                value={formData.phone}
                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                error={!!fieldErrors.phone}
                                helperText={fieldErrors.phone}
                            />

                            <PhoneField
                                label="WhatsApp Number"
                                fullWidth
                                defaultCode="+94"
                                value={formData.whatsapp}
                                onChange={(val) => setFormData({ ...formData, whatsapp: val })}
                                error={!!fieldErrors.whatsapp}
                                helperText={fieldErrors.whatsapp}
                            />

                            <TextField
                                label="Email Address"
                                fullWidth
                                floatLabel={true}
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={!!fieldErrors.email}
                                helperText={fieldErrors.email}
                                placeholder="e.g. branch@restaurant.com"
                            />

                            <TextField
                                label="Manager Name"
                                fullWidth
                                floatLabel={true}
                                value={formData.manager_name}
                                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                    </div>

                    {/* Section 3: Address & Location */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8A8F98] mb-3">
                            Address & Location
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextField
                                label="Address Line 1"
                                required
                                fullWidth
                                floatLabel={true}
                                value={formData.address_line1}
                                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                error={!!fieldErrors.address_line1}
                                helperText={fieldErrors.address_line1}
                                placeholder="e.g. No 123, Galle Road"
                            />

                            <TextField
                                label="Address Line 2"
                                fullWidth
                                floatLabel={true}
                                value={formData.address_line2}
                                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                placeholder="e.g. Suite 4, Floor 2"
                            />

                            <TextField
                                label="City"
                                required
                                fullWidth
                                floatLabel={true}
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                error={!!fieldErrors.city}
                                helperText={fieldErrors.city}
                                placeholder="e.g. Colombo"
                            />

                            <TextField
                                label="State / Province"
                                fullWidth
                                floatLabel={true}
                                value={formData.state_province}
                                onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                                placeholder="e.g. Western Province"
                            />

                            <TextField
                                label="Postal Code"
                                fullWidth
                                floatLabel={true}
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                placeholder="e.g. 00300"
                            />

                            <TextField
                                label="Country"
                                fullWidth
                                floatLabel={true}
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="e.g. Sri Lanka"
                            />
                        </div>
                    </div>

                    {/* Section 4: Operating Hours & Facilities */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8A8F98] mb-3">
                            Operating Hours & Facilities
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                            <TextField
                                label="Opening Time"
                                type="time"
                                fullWidth
                                floatLabel={true}
                                value={formData.opening_time}
                                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                            />

                            <TextField
                                label="Closing Time"
                                type="time"
                                fullWidth
                                floatLabel={true}
                                value={formData.closing_time}
                                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-wrap gap-6 pt-3 border-t border-slate-100 dark:border-[#1F2226]">
                            <CheckboxField
                                label="Dine-in Available"
                                checked={formData.has_dining}
                                onChange={(e) => setFormData({ ...formData, has_dining: e.target.checked })}
                            />

                            <CheckboxField
                                label="Delivery Available"
                                checked={formData.has_delivery}
                                onChange={(e) => setFormData({ ...formData, has_delivery: e.target.checked })}
                            />

                            <CheckboxField
                                label="Rooms Available"
                                checked={formData.has_rooms}
                                onChange={(e) => setFormData({ ...formData, has_rooms: e.target.checked })}
                            />
                        </div>
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
