'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

export default function InstructorCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourseAndModules() {
      setLoading(true);
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      setCourse(courseData);

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id);
      setModules(modulesData || []);
      setLoading(false);
    }
    if (id) fetchCourseAndModules();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{course?.name || 'Course'}</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Modules</h2>
        {modules.length > 0 ? (
          <ul>
            {modules.map(m => (
              <li key={m.id} className="mb-2 p-3 bg-gray-50 rounded border">
                <div className="font-semibold">{m.title}</div>
                {m.description && <div className="text-gray-500">{m.description}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No modules available yet.</div>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload Materials</h2>
        <div className="text-gray-500">[Upload materials UI coming soon]</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Enroll Students</h2>
        <div className="text-gray-500">[Enroll students UI coming soon]</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Teaching Companion</h2>
        <div className="text-gray-500">[Teaching companion UI coming soon]</div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Q&A / Student Questions</h2>
        <div className="text-gray-500">[Q&A/chat UI coming soon]</div>
      </div>
    </div>
  );
}
