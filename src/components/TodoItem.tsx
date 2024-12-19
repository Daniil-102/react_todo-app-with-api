import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import cn from 'classnames';
import { editTodo } from '../api/todos';

interface Props {
  todo: Todo;
  handleChangeCompleted: (todo: Todo) => Promise<void>;
  isCheckLoading: number;
  deleteDisabled: number[];
  deleteTodo: (id: number) => Promise<void>;
  showError: (message: string) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export const TodoItem: React.FC<Props> = ({
  todo,
  setTodos,
  handleChangeCompleted,
  isCheckLoading,
  deleteDisabled,
  deleteTodo,
  showError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [input, setInput] = useState(todo.title);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingEditing, setIsLoadingEditing] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isEditing]);

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!input.trim()) {
      // try {
      //   await deleteTodo(todo.id);
      //   setIsEditing(false);
      // } catch (error) {
      //   showError('Unable to delete a todo');
      // } finally {
      //   setIsLoadingEditing(false);
      // }
      deleteTodo(todo.id);
    } else if (input.trim() === todo.title) {
      // setIsLoadingEditing(false);
      setIsEditing(false);
    } else {
      setIsLoadingEditing(true);
      try {
        const newTodo = await editTodo({ ...todo, title: input.trim() });

        setTodos(prevTodos =>
          [...prevTodos].map(todoC => (todoC.id === todo.id ? newTodo : todoC)),
        );
        setIsEditing(false);
      } catch (error) {
        showError('Unable to update a todo');
      } finally {
        setIsLoadingEditing(false);
      }
    }
  };

  const handleEscape = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setInput(todo.title);
      setIsEditing(false);
    }
  };

  const handleEditing = () => {
    setIsEditing(true);
  };

  return (
    <div
      key={todo.id}
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
    >
      <label
        className="todo__status-label"
        onClick={() => handleChangeCompleted(todo)}
      >
        {''}
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
        />
      </label>

      {isEditing ? (
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            data-cy="TodoTitleField"
            className="todo__title-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            onBlur={handleFormSubmit}
            ref={inputRef}
            onKeyUp={handleEscape}
          />
        </form>
      ) : (
        <>
          <span
            ref={titleRef}
            onDoubleClick={handleEditing}
            data-cy="TodoTitle"
            className="todo__title"
          >
            {todo.title}
          </span>
          <button
            onClick={() => deleteTodo(todo.id)}
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            disabled={deleteDisabled.includes(todo.id)}
          >
            ×
          </button>
        </>
      )}

      {/* overlay will cover the todo while it is being deleted or updated */}
      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active':
            deleteDisabled.includes(todo.id) ||
            isCheckLoading === todo.id ||
            isLoadingEditing,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
