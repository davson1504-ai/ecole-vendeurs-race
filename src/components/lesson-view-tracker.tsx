'use client';
import { useEffect } from 'react';
import { recordLessonView } from '@/app/cours/[slug]/actions';
export function LessonViewTracker({lessonId,courseSlug}:{lessonId:string;courseSlug:string}){
  useEffect(()=>{ void recordLessonView(lessonId,courseSlug); },[lessonId,courseSlug]);
  return null;
}
