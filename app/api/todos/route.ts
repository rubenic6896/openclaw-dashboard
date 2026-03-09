import { NextRequest, NextResponse } from 'next/server';
import { getTodos, createTodo, updateTodo, updateTodoStatus, deleteTodo } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const todos = getTodos({ status });
    return NextResponse.json({ todos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, todos: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'updateStatus') {
      updateTodoStatus(body.id, body.status);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'update') {
      updateTodo(body.id, {
        title: body.title,
        description: body.description,
        priority: body.priority,
        deadline: body.deadline,
        tags: body.tags,
        assignee: body.assignee,
        status: body.status,
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'delete') {
      deleteTodo(body.id);
      return NextResponse.json({ success: true });
    }

    const todo = createTodo({
      title: body.title,
      description: body.description,
      priority: body.priority,
      deadline: body.deadline,
      tags: body.tags,
      assignee: body.assignee,
    });
    return NextResponse.json({ todo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
