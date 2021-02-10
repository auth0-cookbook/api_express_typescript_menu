/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as ItemService from "./items.service";
import { BaseItem, Item } from "./item.interface";

import { checkJwt } from "../middleware/authz.middleware";
import { checkPermissions } from "../middleware/permissions.middleware";
import { ItemPermission } from "./item-permission";

/**
 * Router Definition
 */

export const itemsRouter = express.Router();

/**
 * Controller Definitions
 */

// GET items

itemsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const items: Item[] = await ItemService.findAll();

    res.status(200).send(items);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// GET items/:id

itemsRouter.get("/:id", async (req: Request, res: Response) => {
  const id: string = req.params.id;

  try {
    const item: Item = await ItemService.find(id);

    if (item) {
      return res.status(200).send(item);
    }

    res.status(404).send("item not found");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

itemsRouter.use(checkJwt);

// POST items

itemsRouter.post(
  "/",
  checkPermissions(ItemPermission.CreateItems),
  async (req: Request, res: Response) => {
    try {
      const item: BaseItem = req.body;

      const newItem = await ItemService.create(item);

      res.status(201).json(newItem);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

// PUT items/:id

itemsRouter.put(
  "/:id",
  checkPermissions(ItemPermission.UpdateItems),
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    try {
      const itemUpdate: Item = req.body;

      const existingItem: Item = await ItemService.find(id);

      if (existingItem) {
        const updatedItem = await ItemService.update(id, itemUpdate);
        return res.status(200).json(updatedItem);
      }

      const newItem = await ItemService.create(itemUpdate);

      res.status(201).json(newItem);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

// DELETE items/:id

itemsRouter.delete(
  "/:id",
  checkPermissions(ItemPermission.DeleteItems),
  async (req: Request, res: Response) => {
    try {
      const id: string = req.params.id;
      await ItemService.remove(id);

      res.sendStatus(204);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);
