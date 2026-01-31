import { z } from "zod";

export const issueSchema = z.object({
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  issue_type: z.enum(["task", "bug", "story", "epic"]),
  status_id: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assignee_id: z.string().uuid().nullable().optional(),
  epic_id: z.string().uuid().nullable().optional(),
  sprint_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  story_points: z.number().int().min(0).max(100).nullable().optional()
});

export const sprintSchema = z.object({
  name: z.string().min(2),
  goal: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional()
});

export const projectSchema = z.object({
  name: z.string().min(2),
  key: z.string().min(2).max(10),
  description: z.string().nullable().optional()
});

export const workspaceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2)
});
