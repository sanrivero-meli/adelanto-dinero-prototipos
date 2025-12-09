'use client'

import { useState, useEffect } from 'react'
import { supabase, Todo } from '@/lib/supabase'
import TodoInput from '@/components/TodoInput'
import TodoList from '@/components/TodoList'

// Force dynamic rendering to avoid build-time Supabase client issues
export const dynamic = 'force-dynamic'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseAnonKey) {
      setIsSupabaseConfigured(true)
      loadTodos()
    } else {
      // Fallback to localStorage
      const storedTodos = localStorage.getItem('todos')
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos))
      }
      setIsLoading(false)
    }
  }, [])

  const loadTodos = async () => {
    if (!isSupabaseConfigured) {
      const storedTodos = localStorage.getItem('todos')
      if (storedTodos) {
        const todos = JSON.parse(storedTodos)
        // Sort: incomplete first, completed at bottom
        const sortedTodos = [...todos].sort((a, b) => {
          if (a.completed === b.completed) {
            return (a.position || 0) - (b.position || 0)
          }
          return a.completed ? 1 : -1
        })
        setTodos(sortedTodos)
      }
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading todos:', error)
        // Fallback to localStorage
        const storedTodos = localStorage.getItem('todos')
        if (storedTodos) {
          const todos = JSON.parse(storedTodos)
          const sortedTodos = [...todos].sort((a, b) => {
            if (a.completed === b.completed) {
              return (a.position || 0) - (b.position || 0)
            }
            return a.completed ? 1 : -1
          })
          setTodos(sortedTodos)
        }
      } else {
        // Sort: incomplete first, completed at bottom
        const sortedTodos = [...(data || [])].sort((a, b) => {
          if (a.completed === b.completed) {
            return (a.position || 0) - (b.position || 0)
          }
          return a.completed ? 1 : -1
        })
        setTodos(sortedTodos)
      }
    } catch (error) {
      console.error('Error loading todos:', error)
      const storedTodos = localStorage.getItem('todos')
      if (storedTodos) {
        const todos = JSON.parse(storedTodos)
        const sortedTodos = [...todos].sort((a, b) => {
          if (a.completed === b.completed) {
            return (a.position || 0) - (b.position || 0)
          }
          return a.completed ? 1 : -1
        })
        setTodos(sortedTodos)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const cleanupOldCompletedTasks = async () => {
    if (!isSupabaseConfigured) return

    const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('completed', true)
        .lt('completed_at', oneWeekAgo)

      if (!error) {
        await loadTodos()
      }
    } catch (error) {
      console.error('Error cleaning up old tasks:', error)
    }
  }

  useEffect(() => {
    // Clean up old tasks on mount (after a delay)
    if (isSupabaseConfigured) {
      const timer = setTimeout(() => {
        cleanupOldCompletedTasks()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSupabaseConfigured])

  const addTodo = async (text: string) => {
    const incompleteCount = todos.filter(t => !t.completed).length
    
    if (!isSupabaseConfigured) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        position: 0
      }
      // Add at the beginning of incomplete todos
      const incompleteTodos = todos.filter(t => !t.completed)
      const completedTodos = todos.filter(t => t.completed)
      
      // Shift positions of existing incomplete todos
      const shiftedIncomplete = incompleteTodos.map((t, idx) => ({
        ...t,
        position: idx + 1
      }))
      
      const updatedTodos = [newTodo, ...shiftedIncomplete, ...completedTodos]
      setTodos(updatedTodos)
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
      return
    }

    try {
      // Shift positions of existing incomplete todos
      const incompleteTodos = todos.filter(t => !t.completed)
      for (const [idx, todo] of incompleteTodos.entries()) {
        await supabase
          .from('todos')
          .update({ position: idx + 1 })
          .eq('id', todo.id)
      }

      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            text: text,
            completed: false,
            position: 0
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding todo:', error)
        // Fallback to localStorage
        const newTodo: Todo = {
          id: Date.now().toString(),
          text,
          completed: false,
          completed_at: null,
          created_at: new Date().toISOString(),
          position: 0
        }
        const incompleteTodos = todos.filter(t => !t.completed)
        const completedTodos = todos.filter(t => t.completed)
        const shiftedIncomplete = incompleteTodos.map((t, idx) => ({
          ...t,
          position: idx + 1
        }))
        const updatedTodos = [newTodo, ...shiftedIncomplete, ...completedTodos]
        setTodos(updatedTodos)
        localStorage.setItem('todos', JSON.stringify(updatedTodos))
      } else {
        // Reload todos to get updated positions
        await loadTodos()
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        position: 0
      }
      const incompleteTodos = todos.filter(t => !t.completed)
      const completedTodos = todos.filter(t => t.completed)
      const shiftedIncomplete = incompleteTodos.map((t, idx) => ({
        ...t,
        position: idx + 1
      }))
      const updatedTodos = [newTodo, ...shiftedIncomplete, ...completedTodos]
      setTodos(updatedTodos)
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
    }
  }

  const toggleTodo = async (index: number) => {
    const todo = todos[index]
    const newCompletedState = !todo.completed
    
    // Update UI optimistically first
    const updateData = {
      completed: newCompletedState,
      completed_at: newCompletedState ? new Date().toISOString() : null
    }
    
    // Reorder todos: completed tasks go to bottom, incomplete stay at top
    const updatedTodos = [...todos]
    updatedTodos[index] = {
      ...todo,
      ...updateData
    }
    
    // Separate completed and incomplete todos
    const incompleteTodos = updatedTodos.filter(t => !t.completed)
    const completedTodos = updatedTodos.filter(t => t.completed)
    
    // Reorder: incomplete first, then completed
    const reorderedTodos = [...incompleteTodos, ...completedTodos]
    
    // Update positions
    const finalTodos = reorderedTodos.map((todo, index) => ({
      ...todo,
      position: index
    }))
    
    setTodos(finalTodos)
    
    if (!isSupabaseConfigured) {
      localStorage.setItem('todos', JSON.stringify(finalTodos))
      return
    }

    try {
      // Update the todo completion status
      const { error: updateError } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', todo.id)

      if (updateError) {
        console.error('Error updating todo:', updateError)
        localStorage.setItem('todos', JSON.stringify(finalTodos))
        return
      }

      // Update positions for all todos
      for (const [idx, t] of finalTodos.entries()) {
        const { error: positionError } = await supabase
          .from('todos')
          .update({ position: idx })
          .eq('id', t.id)

        if (positionError) {
          console.error('Error updating todo position:', positionError)
        }
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      // Fallback to localStorage on network error
      localStorage.setItem('todos', JSON.stringify(finalTodos))
    }
  }

  const deleteTodo = async (index: number) => {
    const todo = todos[index]
    
    // Update UI optimistically first
    const updatedTodos = todos.filter((_, i) => i !== index)
    setTodos(updatedTodos)
    
    if (!isSupabaseConfigured) {
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
      return
    }

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todo.id)

      if (error) {
        console.error('Error deleting todo:', error)
        // Fallback to localStorage on error
        localStorage.setItem('todos', JSON.stringify(updatedTodos))
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      // Fallback to localStorage on network error
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
    }
  }

  const reorderTodos = async (newTodos: Todo[]) => {
    setTodos(newTodos)
    
    if (!isSupabaseConfigured) {
      localStorage.setItem('todos', JSON.stringify(newTodos))
      return
    }

    try {
      // Batch update positions
      for (const [index, todo] of newTodos.entries()) {
        const { error } = await supabase
          .from('todos')
          .update({ position: index })
          .eq('id', todo.id)

        if (error) {
          console.error('Error updating todo position:', error)
        }
      }
    } catch (error) {
      console.error('Error reordering todos:', error)
    }
  }

  return (
    <div className="container">
      <TodoInput onAdd={addTodo} />
      <TodoList
        todos={todos}
        isLoading={isLoading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onReorder={reorderTodos}
      />
    </div>
  )
}

