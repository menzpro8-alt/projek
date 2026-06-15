'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function saveGeneratedQuestions(questions: any[], subject: string, grade: string, topic: string) {
  try {
    const dataToInsert = questions.map((q) => ({
      subject,
      grade,
      topic,
      difficulty: q.difficulty || 'sedang',
      type: q.type,
      content: q, // The whole question object as JSON
    }));

    await db.question.createMany({
      data: dataToInsert,
    });

    // Revalidate any path that shows the questions
    revalidatePath('/');
    
    return { success: true, count: dataToInsert.length };
  } catch (error) {
    console.error('Error saving questions:', error);
    return { success: false, error: 'Gagal menyimpan soal ke database' };
  }
}
