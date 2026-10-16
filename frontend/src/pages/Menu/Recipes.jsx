import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import { Button, NumberField, SelectField, TextAreaField, TextField } from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";

const blankIngredient = () => ({ raw_material_id: "", quantity: "1", unit_id: "", display_order: "0", notes: "" });
const blank = { menu_item_id: "", instructions: "", yield_quantity: "1", preparation_notes: "", materials: [blankIngredient()] };

export const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [items, setItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [recipeResponse, itemResponse, materialResponse, unitResponse] = await Promise.all([
      api.get("/recipes"), api.get("/menu-items"), api.get("/raw-materials"), api.get("/units"),
    ]);
    setRecipes(recipeResponse.data.data);
    setItems(itemResponse.data.data);
    setMaterials(materialResponse.data.data.filter((material) => material.is_active));
    setUnits(unitResponse.data.data.filter((unit) => unit.is_active));
  };
  useEffect(() => { load().catch((reason) => console.error("Unable to load recipes", reason)); }, []);

  const edit = (row) => {
    setEditingId(row.id);
    setForm({
      menu_item_id: String(row.menu_item_id),
      instructions: row.instructions,
      yield_quantity: String(row.yield_quantity),
      preparation_notes: row.preparation_notes ?? "",
      materials: row.recipe_materials.map((material) => ({
        raw_material_id: String(material.raw_material_id),
        quantity: String(material.quantity),
        unit_id: String(material.unit_id),
        display_order: String(material.display_order),
        notes: material.notes ?? "",
      })),
    });
    setError("");
    setOpen(true);
  };

  const updateMaterial = (index, key, value) => setForm((current) => ({
    ...current,
    materials: current.materials.map((material, rowIndex) => rowIndex === index ? { ...material, [key]: value, ...(key === "raw_material_id" ? { unit_id: "" } : {}) } : material),
  }));

  const save = async () => {
    if (!form.menu_item_id || !form.instructions.trim() || !form.materials.length || form.materials.some((material) => !material.raw_material_id || !material.unit_id || !material.quantity)) {
      setError("Select a menu item, enter instructions, and complete every ingredient row.");
      return;
    }
    setBusy(true);
    setError("");
    const payload = {
      menu_item_id: Number(form.menu_item_id),
      instructions: form.instructions,
      yield_quantity: Number(form.yield_quantity),
      preparation_notes: form.preparation_notes,
      materials: form.materials.map((material, index) => ({ ...material, raw_material_id: Number(material.raw_material_id), quantity: Number(material.quantity), unit_id: Number(material.unit_id), display_order: index })),
    };
    try {
      if (editingId) await api.put(`/recipes/${editingId}`, payload);
      else await api.post("/recipes", payload);
      await load();
      setOpen(false);
    } catch (reason) {
      const messages = reason.response?.data?.errors;
      setError(messages ? Object.values(messages).flat()[0] : reason.response?.data?.message ?? "Unable to save recipe.");
    } finally { setBusy(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Delete the recipe for ${row.menu_item?.name}?`)) return;
    await api.delete(`/recipes/${row.id}`);
    await load();
  };

  const recipeRows = recipes.map((recipe) => ({
    ...recipe,
    item_name: recipe.menu_item?.name ?? "—",
    ingredient_count: recipe.recipe_materials?.length ?? 0,
  }));
  const availableItems = items.filter((item) => !recipes.some((recipe) => recipe.menu_item_id === item.id) || Number(form.menu_item_id) === item.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">Recipes</h1><p className="text-sm text-slate-500 dark:text-[#8A8F98]">Set preparation instructions, yield, and ingredient quantities.</p></div><Button variant="primary" onClick={() => { setEditingId(null); setForm({ ...blank, materials: [blankIngredient()] }); setError(""); setOpen(true); }}>Add Recipe</Button></div>
      <Table columns={[{ key: "item_name", label: "Menu item" }, { key: "yield_quantity", label: "Yield" }, { key: "ingredient_count", label: "Ingredients" }]} data={recipeRows} selectable={false} expandable={false} searchable pagination filterable={false} actions={(row) => [{ label: "Recipe actions", render: () => <ActionMenu label={`Actions for ${row.item_name}`} items={[{ label: "Edit recipe", onClick: () => edit(row) }, { label: "Delete recipe", variant: "danger", onClick: () => remove(row) }]} /> }]} />
      <Dialog isOpen={open} onClose={() => setOpen(false)} title={editingId ? "Edit Recipe" : "Add Recipe"} size="large" primaryButtonText={busy ? "Saving..." : "Save"} secondaryButtonText="Cancel" primaryButtonDisabled={busy} onPrimaryButtonClick={save} onSecondaryButtonClick={() => setOpen(false)}>
        <div className="space-y-4">
          <SelectField label="Menu item" required fullWidth value={form.menu_item_id} options={availableItems.map((item) => ({ value: String(item.id), label: `${item.sku} · ${item.name}` }))} onChange={(event) => setForm({ ...form, menu_item_id: event.target.value })} />
          <TextAreaField label="Instructions" required fullWidth rows={5} value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
          <NumberField label="Yield quantity (portions)" min={0.001} step={0.001} value={form.yield_quantity} onChange={(event) => setForm({ ...form, yield_quantity: event.target.value })} />
          <TextAreaField label="Preparation notes" fullWidth rows={2} value={form.preparation_notes} onChange={(event) => setForm({ ...form, preparation_notes: event.target.value })} />
          <div className="flex items-center justify-between"><h3 className="font-semibold">Ingredients</h3><Button variant="secondary" onClick={() => setForm({ ...form, materials: [...form.materials, blankIngredient()] })}>Add ingredient</Button></div>
          {form.materials.map((ingredient, index) => {
            const material = materials.find((row) => String(row.id) === ingredient.raw_material_id);
            const compatibleUnits = units.filter((unit) => unit.unit_type === material?.base_unit?.unit_type);
            return <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-[#1F2226] sm:grid-cols-2">
              <SelectField label="Raw material" required fullWidth value={ingredient.raw_material_id} options={materials.map((row) => ({ value: String(row.id), label: `${row.sku} · ${row.name}` }))} onChange={(event) => updateMaterial(index, "raw_material_id", event.target.value)} />
              <NumberField label="Quantity" min={0.0001} step={0.0001} value={ingredient.quantity} onChange={(event) => updateMaterial(index, "quantity", event.target.value)} />
              <SelectField label="Unit" required fullWidth value={ingredient.unit_id} options={compatibleUnits.map((unit) => ({ value: String(unit.id), label: `${unit.name} (${unit.symbol})` }))} onChange={(event) => updateMaterial(index, "unit_id", event.target.value)} />
              <TextField label="Notes" value={ingredient.notes} onChange={(event) => updateMaterial(index, "notes", event.target.value)} />
              {form.materials.length > 1 && <Button variant="ghost" onClick={() => setForm({ ...form, materials: form.materials.filter((_, rowIndex) => rowIndex !== index) })}>Remove ingredient</Button>}
            </div>;
          })}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
};

export default Recipes;
