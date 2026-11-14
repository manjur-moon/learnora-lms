import { Link } from "react-router";
import { ArrowUpRight, BookOpen, Plus, LibraryBig, PenLine } from "lucide-react";
import { usePublicCourses } from "../../hooks/usePublicCourses";

export function AdminDashboardPage() {
  const { courses, loadState, errorMessage, reload } = usePublicCourses();
  const latest = courses.slice(0, 4);
  return (
    <main>
      <div className="admin-page-head">
        <div><span className="admin-eyebrow">OVERVIEW / YOUR WORKSPACE</span><h1>Build something <em>worth learning.</em></h1><p>Manage your course library and keep every lecture organized.</p></div>
        <Link className="admin-btn admin-btn--primary" to="/admin/courses/new"><Plus size={17}/> Create course</Link>
      </div>
      <div className="admin-stat-grid">
        <div className="admin-stat admin-stat--primary"><BookOpen size={24}/><span>YOUR COURSE LIBRARY</span><strong>{loadState === "success" ? courses.length : "—"}</strong><small>Courses currently available to students</small></div>
        <div className="admin-stat"><LibraryBig size={23}/><span>CONTENT MANAGEMENT</span><strong>All in one place</strong><small>Edit courses, manage lectures, publish instantly</small></div>
        <div className="admin-stat"><PenLine size={23}/><span>NEXT STEP</span><strong>Keep teaching</strong><small>Add lectures to your existing courses</small></div>
      </div>
      <section className="admin-panel">
        <div className="admin-panel__header"><div><span className="admin-eyebrow">YOUR CONTENT</span><h2>Recently added <em>courses.</em></h2></div><Link to="/admin/courses" className="admin-text-link">Manage all <ArrowUpRight size={17}/></Link></div>
        {loadState === "loading" && <div className="admin-state" role="status">Loading courses…</div>}
        {loadState === "error" && <div className="admin-state" role="alert"><p>{errorMessage}</p><button className="admin-btn admin-btn--outline" onClick={reload} type="button">Retry</button></div>}
        {loadState === "success" && latest.length === 0 && <div className="admin-state"><p>Your library is empty. Start by creating a course.</p><Link className="admin-btn admin-btn--primary" to="/admin/courses/new">Create your first course</Link></div>}
        {loadState === "success" && latest.length > 0 && (
          <div className="admin-course-rows">{latest.map((course) => (
            <div className="admin-course-row" key={course._id}>
              <img src={course.thumbnailUrl} alt="" loading="lazy"/>
              <div><h3>{course.title}</h3><p>{course.description}</p></div>
              <span className="admin-row-price">{course.price === 0 ? "Free" : `৳${course.price.toLocaleString("en-BD")}`}</span>
              <Link className="admin-icon-link" to={`/admin/courses/${course._id}/lectures`} aria-label={`Manage lectures for ${course.title}`}><ArrowUpRight size={18}/></Link>
            </div>
          ))}</div>
        )}
      </section>
    </main>
  );
}
