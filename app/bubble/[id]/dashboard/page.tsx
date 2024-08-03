"use client"

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Task {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export default function BubbleDashboardPage() {
  const params = useParams();
  const [bubbleTitle, setBubbleTitle] = useState("Loading...");
  const [finalTitle, setFinalTitle] = useState("New Untitled");
  const supabase = createClient();

  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newTaskContents, setNewTaskContents] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchBubbleData();
  }, [params.id]);

  const fetchBubbleData = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('team_name, final_title')
      .eq('id', params.id)
      .single();

    if (data) {
      setBubbleTitle(data.team_name);
      setFinalTitle(data.final_title || "New Untitled");
      document.title = `${data.team_name} | Sparqs`;
    } else if (error) {
      console.error('Error fetching bubble:', error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = [...columns];
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const destColumn = newColumns.find(col => col.id === destination.droppableId);

    if (sourceColumn && destColumn) {
      const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
      destColumn.tasks.splice(destination.index, 0, movedTask);
      setColumns(newColumns);
    }
  };

  const addColumn = () => {
    if (newColumnTitle.trim() === "") return;
    const newColumn: Column = {
      id: Date.now().toString(),
      title: newColumnTitle,
      tasks: []
    };
    setColumns([...columns, newColumn]);
    setNewColumnTitle("");
  };

  const addTask = (columnId: string) => {
    const taskContent = newTaskContents[columnId];
    if (!taskContent || taskContent.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      content: taskContent
    };

    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    });

    setColumns(newColumns);
    setNewTaskContents({ ...newTaskContents, [columnId]: "" });
  };

  return (
    <div className="p-2">
      <div className="bg-[#8cb9bd] rounded-xl p-6 mb-4">
        <h1 className="text-3xl font-bold text-white">{bubbleTitle}</h1>
        <h2 className="text-2xl font-bold text-gray-50">{finalTitle}</h2>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={newColumnTitle}
          onChange={(e) => setNewColumnTitle(e.target.value)}
          placeholder="New column name"
          className="border p-2 mr-2"
        />
        <button onClick={addColumn} className="bg-blue-500 text-white p-2 rounded">Add Column</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto">
          {columns.map(column => (
            <div key={column.id} className="bg-gray-100 p-4 rounded-lg flex-1 min-w-[250px]">
              <h3 className="font-bold mb-4">{column.title}</h3>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px]"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 mb-2 rounded shadow"
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="mt-2">
                <input
                  type="text"
                  value={newTaskContents[column.id] || ""}
                  onChange={(e) => setNewTaskContents({ ...newTaskContents, [column.id]: e.target.value })}
                  placeholder="New task"
                  className="border p-1 w-full mb-2"
                />
                <button onClick={() => addTask(column.id)} className="bg-green-500 text-white p-1 rounded w-full">Add Task</button>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}