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
        setTodos(JSON.parse(storedTodos))
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
          setTodos(JSON.parse(storedTodos))
        }
      } else {
        setTodos(data || [])
      }
    } catch (error) {
      console.error('Error loading todos:', error)
      const storedTodos = localStorage.getItem('todos')
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos))
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
    if (!isSupabaseConfigured) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        position: todos.length
      }
      const updatedTodos = [...todos, newTodo]
      setTodos(updatedTodos)
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
      return
    }

    try {
      const position = todos.length
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            text: text,
            completed: false,
            position: position
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
          position: todos.length
        }
        const updatedTodos = [...todos, newTodo]
        setTodos(updatedTodos)
        localStorage.setItem('todos', JSON.stringify(updatedTodos))
      } else {
        setTodos([...todos, data])
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        position: todos.length
      }
      const updatedTodos = [...todos, newTodo]
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
    const updatedTodos = [...todos]
    updatedTodos[index] = {
      ...todo,
      ...updateData
    }
    setTodos(updatedTodos)
    
    if (!isSupabaseConfigured) {
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
      return
    }

    try {
      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', todo.id)

      if (error) {
        console.error('Error updating todo:', error)
        // Fallback to localStorage on error
        localStorage.setItem('todos', JSON.stringify(updatedTodos))
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      // Fallback to localStorage on network error
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
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

