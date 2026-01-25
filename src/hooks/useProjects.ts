import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
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
    const now = new Date().toISOString()
    const newProject: Project = {
      ...projectData,
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

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    await updateData(data => ({
      ...data,
      projects: data.projects.filter(p => p.id !== id),
      tasks: data.tasks.filter(t => t.projectId !== id)
    }))

    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const setProjectStatus = useCallback(async (id: string, status: ProjectStatus): Promise<void> => {
    await updateProject(id, { status })
  }, [updateProject])

  const getProjectsByGoal = useCallback((goalId: string) => {
    return projects.filter(p => p.goalId === goalId)
  }, [projects])

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  return {
    projects,
    activeProjects,
    completedProjects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    setProjectStatus,
    getProjectsByGoal
  }
}
