'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

export default function InstructorCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedSegments, setProcessedSegments] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const fileInputRef = useRef();

  // Fetch course and modules on mount
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

  // Handle file upload and backend processing
  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return alert("Select a file!");
    setProcessing(true);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('lecture-materials')
      .upload(`${id}/${file.name}`, file);
    if (error) {
      alert('Upload failed: ' + error.message);
      setProcessing(false);
      return;
    }
    alert('File uploaded! The backend will now process it.');

    // Trigger backend processing
    try {
      const response = await fetch('http://localhost:8000/process-lecture/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, course_id: id }),
      });
      const result = await response.json();
      if (result.status === "processed") {
        alert(`File processed: ${result.num_segments} segments found.`);
        setProcessedSegments(result.segments || []);
        setSummaries(result.summaries || []);
      } else {
        alert("Backend processing failed.");
      }
    } catch (err) {
      alert("Could not contact backend for processing.");
    }
    setProcessing(false);
  }

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
        <h2 className="text-xl font-semibold mb-2">Upload Lecture Materials</h2>
        <form onSubmit={handleUpload}>
          <input type="file" ref={fileInputRef} className="mb-2" />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded" disabled={processing}>
            {processing ? "Uploading & Processing..." : "Upload"}
          </button>
        </form>
      </div>
      {processedSegments.length > 0 && (
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">Processed Lecture Segments</h2>
          <ul>
            {processedSegments.map((seg, idx) => (
              <li key={idx} className="mb-4">
                <div className="font-bold">Segment {idx + 1}:</div>
                <div className="whitespace-pre-wrap">{seg}</div>
                {summaries[idx] && (
                  <div className="italic text-green-700 mt-1">
                    Summary: {summaries[idx]}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
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
