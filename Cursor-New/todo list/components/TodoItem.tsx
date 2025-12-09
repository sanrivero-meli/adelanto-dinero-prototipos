'use client'

import { useState, DragEvent } from 'react'
import { Todo } from '@/lib/supabase'

interface TodoItemProps {
  todo: Todo
  index: number
  isDragging: boolean
  onToggle: () => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
}

export default function TodoItem({
  todo,
  index,
  isDragging,
  onToggle,
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop
}: TodoItemProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragging) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    onDrop()
  }

  const handleTextDragStart = (e: DragEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    onDragStart()
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onToggle()
  }

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Prevent double-firing, let onChange handle it
    // But ensure the event propagates to trigger onChange
  }

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete()
  }

  return (
    <li
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={handleCheckboxChange}
        onClick={handleCheckboxClick}
        draggable={false}
      />
      <span 
        className="todo-text"
        draggable={true}
        onDragStart={handleTextDragStart}
        onDragEnd={onDragEnd}
      >
        {todo.text}
      </span>
      <button
        className="delete-btn"
        onClick={handleDeleteClick}
        aria-label="Delete todo"
        type="button"
        draggable={false}
      >
        ×
      </button>
    </li>
  )
}

