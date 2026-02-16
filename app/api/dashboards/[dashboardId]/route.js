import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { dashboardId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: dashboard } = await supabase
      .from("dashboard_layouts")
      .select("*, dashboard_widgets(*)")
      .eq("id", dashboardId)
      .single();

    if (!dashboard) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ dashboard });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { dashboardId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Update layout name
    if (body.name) {
      await supabase
        .from("dashboard_layouts")
        .update({ name: body.name, updated_at: new Date().toISOString() })
        .eq("id", dashboardId);
    }

    // Add widget
    if (body.addWidget) {
      const { data, error } = await supabase
        .from("dashboard_widgets")
        .insert({
          layout_id: dashboardId,
          widget_type: body.addWidget.type,
          title: body.addWidget.label || body.addWidget.type,
          config: body.addWidget.config || {},
          position: {
            x: 0,
            y: 0,
            w: body.addWidget.defaultSize?.w || 6,
            h: body.addWidget.defaultSize?.h || 4,
          },
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ widget: data });
    }

    // Remove widget
    if (body.removeWidgetId) {
      await supabase
        .from("dashboard_widgets")
        .delete()
        .eq("id", body.removeWidgetId);
    }

    // Update widget
    if (body.updateWidget) {
      const { id, title, config, position } = body.updateWidget;
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (config !== undefined) updates.config = config;
      if (position !== undefined) updates.position = position;

      await supabase
        .from("dashboard_widgets")
        .update(updates)
        .eq("id", id);
    }

    // Batch update positions
    if (body.layoutUpdates) {
      for (const update of body.layoutUpdates) {
        await supabase
          .from("dashboard_widgets")
          .update({ position: update.position })
          .eq("id", update.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { dashboardId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("dashboard_layouts")
      .delete()
      .eq("id", dashboardId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
