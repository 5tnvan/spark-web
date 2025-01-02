"use server";

import { createClient } from "~~/utils/supabase/server";

export async function updateFollowerRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications")
        .update({ follower_read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateShortFireRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_fires")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}


export async function updateShortCommentRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_comments")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateShortReplyRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_replies")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateLongFormFireRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_long_form_fires")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}


export async function updateLongFormCommentRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_long_form_comments")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateLongFormReplyRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_long_form_replies")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateIdeaFireRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_idea_fires")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}


export async function updateIdeaCommentRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_idea_comments")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateIdeaReplyRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_idea_replies")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        return null;
    }
    return data;
}

export async function updateShortTipRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_tips")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        console.log(error);
        return null;
    }
    return data;
}

export async function updateDirectTipRead(notification_id: any) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("notifications_direct_tips")
        .update({ read: true })
        .eq("id", notification_id);
    if (error) {
        console.log(error);
        return null;
    }
    return data;
}