import { Request, Response } from "express";
import { z } from "zod";
import { Project } from "../models/Project.js";

const CreateProjectSchema = z.object({
  projectName: z.string().min(1),
  originalText: z.string().optional(),
});

const UpdateProjectSchema = z.object({
  projectName: z.string().min(1).optional(),
  originalText: z.string().optional(),
  script: z.string().optional(),
  characters: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        headshotUrl: z.string().optional(),
        fullbodyUrl: z.string().optional(),
        headshotPrompt: z.string().optional(),
        fullbodyPrompt: z.string().optional(),
      })
    )
    .optional(),
  scenes: z
    .array(
      z.object({
        sceneNumber: z.number(),
        prompt: z.string().optional(),
        generatedImageUrl: z.string().optional(),
      })
    )
    .optional(),
});

export async function createProject(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  const doc = await Project.create({
    user: req.user.id,
    projectName: parsed.data.projectName,
    originalText: parsed.data.originalText || "",
  });
  return res.status(201).json({ project: doc });
}

export async function getProjectsByUser(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  const projects = await Project.find({ user: req.user.id }).sort({ updatedAt: -1 });
  return res.json({ projects });
}

export async function getProject(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  const { id } = req.params;
  const project = await Project.findOne({ _id: id, user: req.user.id });
  if (!project) return res.status(404).json({ message: "Project not found" });
  return res.json({ project });
}

export async function updateProject(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  const { id } = req.params;
  const parsed = UpdateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  const updated = await Project.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { $set: parsed.data },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Project not found" });
  return res.json({ project: updated });
}
