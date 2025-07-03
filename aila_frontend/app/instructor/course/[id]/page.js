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

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return alert("Select a file!");
    setProcessing(true);
    const { error } = await supabase.storage
      .from('lecture-materials')
      .upload(`${id}/${file.name}`, file);
    if (error) {
      alert('Upload failed: ' + error.message);
      setProcessing(false);
      return;
    }
    alert('File uploaded! The backend will now process it.');
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

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{course?.name || "Course"}</h1>
      <div className="mb-6 flex gap-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700" disabled>
          Start Lecturing Assistant
        </button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600" disabled>
          Generate Retrieval Practice
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600" disabled>
          Ask Questions or Chat
        </button>
      </div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Modules</h2>
        <div className="grid gap-3">
          {modules.length === 0 ? (
            <div className="text-gray-500">No modules yet.</div>
          ) : (
            modules.map(m => (
              <div key={m.id} className="bg-gray-50 p-3 rounded shadow">
                {m.name}
              </div>
            ))
          )}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload Lecture Materials</h2>
        <form onSubmit={handleUpload} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            accept=".pdf,.pptx"
            disabled={processing}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            type="submit"
            disabled={processing}
          >
            {processing ? "Uploading..." : "Upload"}
          </button>
        </form>
      </section>
      {processedSegments.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Lecture Segments & Summaries</h2>
          <div className="space-y-4">
            {processedSegments.map((seg, i) => (
              <div key={i} className="bg-white shadow rounded p-4">
                <div className="text-gray-700 mb-2 whitespace-pre-line">
                  <span className="font-bold">Segment {i + 1}:</span> {seg}
                </div>
                <div className="text-blue-800 bg-blue-50 rounded p-2">
                  <span className="font-semibold">Summary:</span> {summaries[i]}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
