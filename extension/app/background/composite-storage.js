import { ext } from "../api.js";

const KEY = "composite_scenarios";
const FIELDS = new Set(["name", "repeats", "speed", "displayMoves", "trackMoves", "mode", "seconds"]);

function applyFields(entry, fields) {
  if (!entry) return;
  for (const [key, value] of Object.entries(fields)) {
    if (FIELDS.has(key)) entry[key] = value;
  }
}

export async function updateComposites(operations) {
  const data = await ext.storage.local.get(KEY);
  const composites = Array.isArray(data[KEY]) ? data[KEY] : [];
  let duplicatedItem = null;
  for (const operation of operations) {
    const { compositeId, itemId, entry, fields, beforeId, copyId } = operation;
    const index = composites.findIndex((item) => item.id === compositeId);
    const composite = composites[index];
    if (operation.type === "create" && !composite) {
      composites.unshift(entry);
    } else if (operation.type === "delete" && composite) {
      composites.splice(index, 1);
    } else if (operation.type === "move" && composite && beforeId !== compositeId) {
      composites.splice(index, 1);
      const next = composites.findIndex((item) => item.id === beforeId);
      composites.splice(next < 0 ? composites.length : next, 0, composite);
    } else if (operation.type === "edit") {
      applyFields(composite, fields);
    } else if (composite) {
      const items = composite.items;
      const itemIndex = items.findIndex((item) => item.id === itemId);
      if (operation.type === "append" && itemIndex < 0) {
        items.push(entry);
      } else if (operation.type === "duplicate-item" && itemIndex >= 0 &&
                 typeof copyId === "string" &&
                 !items.some((item) => item.id === copyId)) {
        const copy = structuredClone(items[itemIndex]);
        copy.id = copyId;
        if (copy.kind !== "pause") copy.name = `↳ ${copy.name}`;
        items.splice(itemIndex + 1, 0, copy);
        duplicatedItem = copy;
      } else if (operation.type === "edit-item") {
        applyFields(items[itemIndex], fields);
      } else if (operation.type === "delete-item" && itemIndex >= 0) {
        items.splice(itemIndex, 1);
      } else if (operation.type === "move-item" && itemIndex >= 0) {
        const [item] = items.splice(itemIndex, 1);
        const next = items.findIndex((entry) => entry.id === beforeId);
        items.splice(next < 0 ? items.length : next, 0, item);
      }
    }
  }
  await ext.storage.local.set({ [KEY]: composites });
  return { ok: true, duplicatedItem };
}
