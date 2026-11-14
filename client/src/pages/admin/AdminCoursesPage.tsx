import { useState } from "react";
import { ArrowUpRight, BookOpen, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { usePublicCourses } from "../../hooks/usePublicCourses";
import type { Course } from "../../types/course";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { deleteAdminCourse, getAdminErrorMessage } from "../../services/admin.service";

export function AdminCoursesPage() {
  const { courses, loadState, errorMessage, reload } = usePublicCourses();
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setActionError("");
    try {
      await deleteAdminCourse(deleteTarget._id);
      setNotice(`Course “${deleteTarget.title}” and its lectures were deleted.`);
      setDeleteTarget(null);
      reload();
    } catch (error) {
      setActionError(getAdminErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main>
      <div className="admin-page-head">
        <div><span className="admin-eyebrow">YOUR CONTENT / COURSES</span><h1>Course <em>library.</em></h1><p>Organize, update, or remove learning experiences from your library.</p></div>
        <Link to="/admin/courses/new" className="admin-btn admin-btn--primary"><Plus size={17}/> New course</Link>
      </div>
      {notice && <div className="admin-alert admin-alert--success" role="status">{notice}</div>}
      {actionError && <div className="admin-alert admin-alert--error" role="alert">{actionError}</div>}
      <section className="admin-panel">
        <div className="admin-panel__header"><div><span className="admin-eyebrow">MANAGE CONTENT</span><h2>All <em>courses.</em></h2></div>{loadState === "success" && <span className="admin-count">{courses.length} total</span>}</div>
        {loadState === "loading" && <div className="admin-state" role="status">Loading your course library…</div>}
        {loadState === "error" && <div className="admin-state" role="alert"><p>{errorMessage}</p><button type="button" className="admin-btn admin-btn--outline" onClick={reload}>Retry</button></div>}
        {loadState === "success" && courses.length === 0 && <div className="admin-state"><BookOpen size={32}/><h3>No courses yet</h3><p>Create your first course to begin adding lectures.</p><Link className="admin-btn admin-btn--primary" to="/admin/courses/new">Create course</Link></div>}
        {loadState === "success" && courses.length > 0 && <div className="admin-management-list">{courses.map((course) => (
          <article className="admin-management-course" key={course._id}>
            <img src={course.thumbnailUrl} alt="" loading="lazy"/>
            <div className="admin-management-course__copy"><h3>{course.title}</h3><p>{course.description}</p><span>{course.price === 0 ? "Free" : `৳${course.price.toLocaleString("en-BD")}`}</span></div>
            <div className="admin-management-course__actions">
              <Link to={`/admin/courses/${course._id}/lectures`} className="admin-btn admin-btn--outline"><Layers size={16}/> Lectures</Link>
              <Link to={`/admin/courses/${course._id}/edit`} className="admin-square-btn" aria-label={`Edit ${course.title}`} title="Edit course"><Pencil size={17}/></Link>
              <button type="button" className="admin-square-btn admin-square-btn--danger" aria-label={`Delete ${course.title}`} title="Delete course" onClick={() => { setActionError(""); setDeleteTarget(course); }}><Trash2 size={17}/></button>
              <Link to={`/courses/${course._id}`} className="admin-square-btn" title="View public course" aria-label={`View ${course.title} on student site`} target="_blank" rel="noreferrer"><ArrowUpRight size={17}/></Link>
            </div>
          </article>
        ))}</div>}
      </section>
      {deleteTarget && <ConfirmDialog title="Delete this course?" description={`“${deleteTarget.title}” and every lecture belonging to it will be permanently deleted. This cannot be undone.`} busy={deleting} error={actionError} onCancel={() => { setDeleteTarget(null); setActionError(""); }} onConfirm={() => void confirmDelete()}/>}
    </main>
  );
}
