'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState('');
  const [roleChecked, setRoleChecked] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profile || profile.role !== 'instructor') {
        router.replace('/student');
        return;
      }
      setRoleChecked(true);
    }
    checkAuthAndRole();
  }, [router]);

  useEffect(() => {
    if (!roleChecked || !userId) return;
    fetchCourses();
  }, [roleChecked, userId]);

  async function fetchCourses() {
    setLoading(true);
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', userId);
    setCourses(data || []);
    setLoading(false);
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!newCourse) return;
    await supabase
      .from('courses')
      .insert([{ name: newCourse, instructor_id: userId }]);
    setNewCourse('');
    fetchCourses();
  }

  if (!roleChecked) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
      <p className="mb-6 text-gray-600">Welcome! Here are your courses.</p>
      <form onSubmit={handleCreateCourse} className="flex gap-2 mb-8">
        <input
          className="flex-1 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="New course name"
          value={newCourse}
          onChange={e => setNewCourse(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          type="submit"
        >
          Create Course
        </button>
      </form>
      {loading ? (
        <div className="text-gray-500">Loading courses...</div>
      ) : (
        <div className="grid gap-4">
          {courses.length === 0 ? (
            <div className="text-gray-500">No courses yet.</div>
          ) : (
            courses.map(course => (
              <div
                key={course.id}
                className="bg-white shadow rounded p-4 flex items-center justify-between"
              >
                <span className="font-medium">{course.name}</span>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => router.push(`/instructor/course/${course.id}`)}
                >
                  Go to Course
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
