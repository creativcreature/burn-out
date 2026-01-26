import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import { NewProjectSchema, validate } from '../data/validation'
import type { Project, ProjectStatus } from '../data/types'

type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'>

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getData()
        setProjects(data.projects)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  const addProject = useCallback(async (projectData: NewProject): Promise<Project> => {
    // Validate input
    const validation = validate(NewProjectSchema, projectData)
    if (!validation.success) {
      throw new Error(`Invalid project: ${validation.error}`)
    }

    const now = new Date().toISOString()
    const newProject: Project = {
      ...validation.data,
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
      order: projects.length
    }

    await updateData(data => ({
      ...data,
      projects: [...data.projects, newProject]
    }))

    setProjects(prev => [...prev, newProject])
    return newProject
  }, [projects.length])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>): Promise<void> => {
    const now = new Date().toISOString()

    await updateData(data => ({
      ...data,
      projects: data.projects.map(project =>
        project.id === id ? { ...project, ...updates, updatedAt: now } : project
      )
    }))

    setProjects(prev => prev.map(project =>
      project.id === id ? { ...project, ...updates, updatedAt: now } : project
    ))
  }, [])

  const setProjectStatus = useCallback(async (id: string, status: ProjectStatus): Promise<void> => {
    await updateProject(id, { status })
  }, [updateProject])

  const getProjectsByGoal = useCallback((goalId: string) => {
    return projects.filter(p => p.goalId === goalId)
  }, [projects])

  // Get a single project by ID
  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(p => p.id === id)
  }, [projects])

  // Get child projects of a parent project
  const getSubProjects = useCallback((parentId: string): Project[] => {
    return projects.filter(p => p.parentProjectId === parentId)
  }, [projects])

  // Get only root-level projects for a goal (no parent)
  const getRootProjectsByGoal = useCallback((goalId: string): Project[] => {
    return projects.filter(p => p.goalId === goalId && !p.parentProjectId)
  }, [projects])

  // Get the ancestor chain from root to this project
  const getProjectPath = useCallback((id: string): Project[] => {
    const path: Project[] = []
    let current = projects.find(p => p.id === id)

    while (current) {
      path.unshift(current)
      if (current.parentProjectId) {
        current = projects.find(p => p.id === current!.parentProjectId)
      } else {
        break
      }
    }

    return path
  }, [projects])

  // Check if a project has any sub-projects
  const hasSubProjects = useCallback((id: string): boolean => {
    return projects.some(p => p.parentProjectId === id)
  }, [projects])

  // Helper to get all descendant project IDs recursively
  const getAllDescendantIds = useCallback((parentId: string): string[] => {
    const descendants: string[] = []
    const children = projects.filter(p => p.parentProjectId === parentId)

    for (const child of children) {
      descendants.push(child.id)
      descendants.push(...getAllDescendantIds(child.id))
    }

    return descendants
  }, [projects])

  // Updated delete to cascade delete children
  const deleteProjectWithChildren = useCallback(async (id: string): Promise<void> => {
    const descendantIds = getAllDescendantIds(id)
    const allIdsToDelete = [id, ...descendantIds]

    await updateData(data => ({
      ...data,
      projects: data.projects.filter(p => !allIdsToDelete.includes(p.id)),
      tasks: data.tasks.filter(t => !t.projectId || !allIdsToDelete.includes(t.projectId))
    }))

    setProjects(prev => prev.filter(p => !allIdsToDelete.includes(p.id)))
  }, [getAllDescendantIds])

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  return {
    projects,
    activeProjects,
    completedProjects,
    isLoading,
    addProject,
    updateProject,
    deleteProject: deleteProjectWithChildren,
    setProjectStatus,
    getProjectsByGoal,
    getProject,
    getSubProjects,
    getRootProjectsByGoal,
    getProjectPath,
    hasSubProjects
  }
}
