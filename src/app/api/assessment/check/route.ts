import { NextRequest, NextResponse } from "next/server";
import { assessStudentAnswer } from "@/lib/langchain/assessment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentAnswerId, answerKeyId } = body;
    
    if (!studentAnswerId || !answerKeyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const result = await assessStudentAnswer(studentAnswerId, answerKeyId);
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error assessing answer:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}