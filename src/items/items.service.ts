// src/items/items.service.ts

/**
 * Data Model Interfaces
 */

import { BaseItem, Item } from "./item.interface";

import { customAlphabet } from "nanoid";

import {
  getItemsDb,
  getMenusDb,
  updateItemsDb,
  updateMenusDb,
} from "../database/database.service";

const nanoid = customAlphabet("1234567890abcdef", 10);

/**
 * Service Methods
 */

export const findAll = async (): Promise<Item[]> => {
  const itemsDb = await getItemsDb();
  return Object.values(itemsDb);
};

export const find = async (id: string): Promise<Item> => {
  const itemsDb = await getItemsDb();
  return itemsDb[id];
};

export const create = async (newItem: BaseItem): Promise<Item> => {
  const itemsDb = await getItemsDb();
  const menusDb = await getMenusDb();
  const id = nanoid();

  const item: Item = { ...newItem, id };

  itemsDb[id] = item;
  
  if (!menusDb[item.category]) {
    menusDb[item.category] = {
      id: item.category,
      items: [item.id]
    }
  } else {
    menusDb[item.category].items.push(item.id);
  }

  await updateItemsDb(itemsDb);
  await updateMenusDb(menusDb);

  return itemsDb[id];
};

export const update = async (
  id: string,
  itemUpdate: BaseItem
): Promise<Item | null> => {
  const itemsDb = await getItemsDb();
  const item = await find(id);

  if (!item) {
    return null;
  }

  itemsDb[id] = { id, ...itemUpdate };

  await updateItemsDb(itemsDb);

  return itemsDb[id];
};

export const remove = async (id: string): Promise<null | void> => {
  const itemsDb = await getItemsDb();
  const menusDb = await getMenusDb();
  const item = await find(id);

  if (!item) {
    return null;
  }

  const menuItemIds = new Set(menusDb[item.category].items);

  delete itemsDb[id];
  menuItemIds.delete(item.id);
  menusDb[item.category].items = Array.from(menuItemIds);

  await updateItemsDb(itemsDb);
  await updateMenusDb(menusDb);
};
