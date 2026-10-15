import React, { useState, useEffect } from "react";
import { TextField, NumberField, TextAreaField, Button } from "../components/DataFields";
import { Table } from "../components/Tables";
import { ActionMenu } from "../components/ActionMenu";
import { Dialog } from "../components/Popups";
import api from "../axiosClient";


export const Roles = () => {

    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        access_level: "10",
    });


    const [fieldErrors, setFieldErrors] = useState({});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/roles");

            const rolesData = response.data?.data || [];
            setRoles(rolesData);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchRoles();
    }, []);


    const columns = [
        { key: "name", label: "Role Name", sortable: true },
        { key: "description", label: "Description" },
        { key: "access_level", label: "Access Level", sortable: true },
    ];

    const handleOpenEdit = (role) => {
        setIsEditMode(true);
        setFormData({
            id: role.id,
            name: role.name || "",
            description: role.description || "",
            access_level: role.access_level || "10",
        });
        setFieldErrors({});
        setShowModal(true);
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setFormData({ id: null, name: "", description: "", access_level: "10" });
        setFieldErrors({});
        setShowModal(true);
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setFormData({ id: null, name: "", description: "", access_level: "10" });
        setFieldErrors({});
    };


    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Role name is required.";
        if (!formData.access_level) errors.access_level = "Access level is required.";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Add / Edit submit handler
    const handleSubmitRole = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                access_level: Number(formData.access_level),
            };

            if (isEditMode) {

                await api.put(`/roles/${formData.id}`, payload);
            } else {

                await api.post("/roles", payload);
            }

            handleCloseModal();
            fetchRoles();
        } catch (error) {
            console.error("Save role failed:", error);

            if (error.response?.data?.errors) {
                setFieldErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDelete = (role) => {
        setRoleToDelete(role);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/roles/${roleToDelete.id}`);
            setShowDeleteModal(false);
            setRoleToDelete(null);
            fetchRoles();
        } catch (error) {
            console.error("Delete role failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* 1. Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F7F8F8]">
                        Roles
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-[#8A8F98]">
                        Manage user roles and their permission access levels.
                    </p>
                </div>

                <Button variant="primary" onClick={handleOpenAdd}>
                    Add Role
                </Button>
            </div>

            {/* 2. Table Component */}
            <Table
                columns={columns}
                data={roles}
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
                        label: "Role actions",
                        render: () => (
                            <ActionMenu
                                label={`Actions for ${row.name}`}
                                items={[
                                    { label: "Edit role", onClick: () => handleOpenEdit(row) },
                                    {
                                        label: "Delete role",
                                        variant: "danger",
                                        onClick: () => handleOpenDelete(row),
                                    },
                                ]}
                            />
                        ),
                    },
                ]}
            />

            {/* 3. Add / Edit Dialog */}
            <Dialog
                isOpen={showModal}
                onClose={handleCloseModal}
                title={isEditMode ? "Edit Role" : "Add Role"}
                size="small"
                primaryButtonText={isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
                secondaryButtonText="Cancel"
                primaryButtonDisabled={isSubmitting}
                secondaryButtonDisabled={isSubmitting}
                onPrimaryButtonClick={handleSubmitRole}
                onSecondaryButtonClick={handleCloseModal}
            >
                <div className="flex flex-col gap-4 py-2">
                    <TextField
                        label="Role Name"
                        required
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                    />

                    <NumberField
                        label="Access Level (1 - 100)"
                        required
                        fullWidth
                        min={1}
                        max={100}
                        value={formData.access_level}
                        onChange={(event) => setFormData({ ...formData, access_level: event.target.value })}
                        error={!!fieldErrors.access_level}
                        helperText={fieldErrors.access_level}
                    />

                    <TextAreaField
                        label="Description"
                        fullWidth
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </Dialog>

            {/* 4. Delete Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Role"
                size="small"
                primaryButtonText={isDeleting ? "Deleting..." : "Delete"}
                secondaryButtonText="Cancel"
                primaryButtonDisabled={isDeleting}
                onPrimaryButtonClick={handleConfirmDelete}
                onSecondaryButtonClick={() => setShowDeleteModal(false)}
            >
                <p className="text-sm text-slate-600 dark:text-[#D0D6E0] py-2">
                    Are you sure you want to delete the role{" "}
                    <strong className="text-slate-900 dark:text-white">"{roleToDelete?.name}"</strong>?
                    This action cannot be undone.
                </p>
            </Dialog>
        </div>
    );
};

export default Roles;
