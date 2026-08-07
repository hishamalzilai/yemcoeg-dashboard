import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename preserving extension
    const extension = file.name.split('.').pop() || "jpg";
    const fileName = `${uuidv4()}.${extension}`;

    // Upload to Supabase Storage Bucket 'yemeni-images'
    const { data, error } = await supabase.storage
      .from("yemeni-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      return NextResponse.json({ error: "Upload failed to Supabase" }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("yemeni-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
