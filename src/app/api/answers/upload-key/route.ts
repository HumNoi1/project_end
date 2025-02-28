import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createAnswerKeyEmbeddings } from "@/lib/langchain/embeddings";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const subjectId = formData.get("subjectId") as string;
    const termId = formData.get("termId") as string;
    const folderId = formData.get("folderId") as string;
    const maxScore = formData.get("maxScore") as string;
    const description = formData.get("description") as string;
    
    if (!file || !subjectId || !termId || !folderId || !maxScore) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // อ่านเนื้อหาของไฟล์
    const content = await file.text();
    
    // เก็บไฟล์ใน Supabase Storage
    const fileName = `answerkeys/${subjectId}/${file.name}`;
    const { error: storageError } = await supabaseAdmin
      .storage
      .from("files")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });
      
    if (storageError) {
      throw storageError;
    }
    
    // สร้างเรคอร์ดใน answer_keys
    const { data: answerKey, error: dbError } = await supabaseAdmin
      .from('answer_keys')
      .insert({
        file_name: file.name,
        content: content,
        file_path: fileName,
        file_size: file.size,
        file_type: file.type,
        subject_id: subjectId,
        term_id: termId,
        max_score: parseInt(maxScore),
        description: description,
      })
      .select()
      .single();
      
    if (dbError) {
      throw dbError;
    }
    
    // สร้าง embeddings (อาจทำแบบ async เพื่อไม่ให้ผู้ใช้รอนาน)
    const chunksCount = await createAnswerKeyEmbeddings(
      answerKey.answer_key_id,
      content
    );
    
    return NextResponse.json({
      success: true,
      answerKeyId: answerKey.answer_key_id,
      chunksCount,
    });
  } catch (error: unknown) {
    console.error("Error uploading answer key:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}