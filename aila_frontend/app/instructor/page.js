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

  // Protect route and get user ID
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
    // eslint-disable-next-line
  }, [roleChecked, userId]);

  async function fetchCourses() {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', userId);
    if (!error) setCourses(data || []);
    setLoading(false);
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!newCourse) return;
    const { error } = await supabase
      .from('courses')
      .insert([{ name: newCourse, instructor_id: userId }]);
    if (!error) {
      setNewCourse('');
      fetchCourses();
    }
  }

  if (!roleChecked) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>
      <form onSubmit={handleCreateCourse} className="flex mb-6">
        <input
          type="text"
          placeholder="New course name"
          className="flex-1 px-3 py-2 border rounded-l"
          value={newCourse}
          onChange={e => setNewCourse(e.target.value)}
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-r">
          Create Course
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {courses && courses.length > 0 ? courses.map(course => (
            <li
              key={course.id}
              className="mb-2 p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <span>{course.name}</span>
              <button
                className="text-blue-600 underline"
                onClick={() => router.push(`/instructor/course/${course.id}`)}
              >
                Go to Course
              </button>
            </li>
          )) : <div className="text-gray-500">No courses yet.</div>}
        </ul>
      )}
    </div>
  );
}
