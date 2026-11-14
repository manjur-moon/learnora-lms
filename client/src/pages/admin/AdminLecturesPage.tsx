import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, Pencil, Plus, Trash2, Video, X } from "lucide-react";
import { Link, useParams } from "react-router";
import type { Course } from "../../types/course";
import type { Lecture } from "../../types/lecture";
import { getPublicCourse, getPublicLectures } from "../../services/course.service";
import { createAdminLecture, deleteAdminLecture, getAdminErrorMessage, updateAdminLecture } from "../../services/admin.service";
import { lectureFormSchema } from "../../validations/admin-forms";
import type { LectureFormValues } from "../../validations/admin-forms";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";

const defaultLecture: LectureFormValues = { title: "", description: "", videoUrl: "", order: 0 };

export function AdminLecturesPage() {
  const { courseId = "" } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Lecture | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lecture | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LectureFormValues>({
    resolver: zodResolver(lectureFormSchema), defaultValues: defaultLecture,
  });

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const result = await getPublicLectures(courseId, signal);
    if (signal?.aborted) return;
    setLectures(result);
  }, [courseId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    Promise.all([getPublicCourse(courseId, controller.signal), getPublicLectures(courseId, controller.signal)])
      .then(([nextCourse, nextLectures]) => {
        if (controller.signal.aborted) return;
        setCourse(nextCourse);
        setLectures(nextLectures);
        setLoading(false);
      }).catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(getAdminErrorMessage(error));
        setLoading(false);
      });
    return () => controller.abort();
  }, [courseId]);

  function beginEdit(lecture: Lecture) {
    setEditing(lecture);
    setActionError("");
    setNotice("");
    reset({ title: lecture.title, description: lecture.description, videoUrl: lecture.videoUrl, order: lecture.order });
    document.getElementById("admin-lecture-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetEditor() {
    setEditing(null);
    setActionError("");
    reset(defaultLecture);
  }

  async function saveLecture(values: LectureFormValues) {
    if (!courseId) return;
    setActionError("");
    setNotice("");
    try {
      if (editing) {
        await updateAdminLecture(courseId, editing._id, values);
        setNotice("Lecture updated successfully.");
      } else {
        await createAdminLecture(courseId, values);
        setNotice("Lecture added to this course.");
      }
      setEditing(null);
      reset(defaultLecture);
      await refresh();
    } catch (error) {
      setActionError(getAdminErrorMessage(error));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting || !courseId) return;
    setDeleting(true);
    setActionError("");
    setNotice("");
    try {
      await deleteAdminLecture(courseId, deleteTarget._id);
      if (editing?._id === deleteTarget._id) resetEditor();
      setDeleteTarget(null);
      setNotice("Lecture deleted.");
      await refresh();
    } catch (error) {
      setActionError(getAdminErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main>
      <Link className="admin-back" to="/admin/courses"><ArrowLeft size={16}/> All courses</Link>
      <div className="admin-page-head"><div><span className="admin-eyebrow">CONTENT MANAGEMENT / LECTURES</span><h1>Course <em>lectures.</em></h1><p>{course?.title ?? "Manage your course curriculum"}</p></div>{course && <Link className="admin-btn admin-btn--outline" to={`/courses/${course._id}`} target="_blank" rel="noreferrer">View student page</Link>}</div>
      {loading && <div className="admin-state" role="status">Loading course and lectures…</div>}
      {loadError && <div className="admin-alert admin-alert--error" role="alert">{loadError} <Link to="/admin/courses">Return to courses</Link></div>}
      {!loading && !loadError && course && (
        <>
          {notice && <div className="admin-alert admin-alert--success" role="status">{notice}</div>}
          <div className="admin-lecture-layout">
            <section className="admin-panel admin-lectures-list">
              <div className="admin-panel__header"><div><span className="admin-eyebrow">COURSE CURRICULUM</span><h2>Lesson <em>library.</em></h2></div><span className="admin-count">{lectures.length} lectures</span></div>
              {lectures.length === 0 ? (
                <div className="admin-state"><BookOpen size={34}/><h3>No lectures yet</h3><p>Use the form to add the first lecture to this course.</p></div>
              ) : <div className="admin-lecture-items">{lectures.map((lecture, index) => (
                <article key={lecture._id} className={`admin-lecture-item${editing?._id === lecture._id ? " admin-lecture-item--editing" : ""}`}>
                  <span className="admin-lecture-item__number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="admin-lecture-item__info"><h3>{lecture.title}</h3><p>{lecture.description}</p><span>Order {lecture.order} · <Video size={13}/> Video URL attached</span></div>
                  <div className="admin-lecture-item__actions"><button type="button" aria-label={`Edit lecture ${lecture.title}`} title="Edit lecture" onClick={() => beginEdit(lecture)} className="admin-square-btn"><Pencil size={17}/></button><button type="button" aria-label={`Delete lecture ${lecture.title}`} title="Delete lecture" onClick={() => { setActionError(""); setDeleteTarget(lecture); }} className="admin-square-btn admin-square-btn--danger"><Trash2 size={17}/></button></div>
                </article>
              ))}</div>}
            </section>
            <section className="admin-panel admin-lecture-editor" id="admin-lecture-form">
              <div className="admin-panel__header"><div><span className="admin-eyebrow">{editing ? "EDIT LESSON" : "ADD LESSON"}</span><h2>{editing ? "Edit" : "New"} <em>lecture.</em></h2></div>{editing && <button type="button" className="admin-square-btn" aria-label="Stop editing" onClick={resetEditor}><X size={18}/></button>}</div>
              <form className="admin-form admin-edit-form" noValidate onSubmit={handleSubmit(saveLecture)}>
                <div className="admin-field"><label htmlFor="lecture-title">Lecture title <b>*</b></label><input id="lecture-title" maxLength={150} placeholder="e.g. Introduction to React" aria-invalid={!!errors.title} {...register("title")}/>{errors.title && <span className="admin-field__error">{errors.title.message}</span>}</div>
                <div className="admin-field"><label htmlFor="lecture-description">Description <b>*</b></label><textarea id="lecture-description" rows={4} maxLength={2000} placeholder="What does this lecture cover?" aria-invalid={!!errors.description} {...register("description")}/>{errors.description && <span className="admin-field__error">{errors.description.message}</span>}</div>
                <div className="admin-field"><label htmlFor="lecture-video">Video URL <b>*</b></label><input id="lecture-video" type="url" maxLength={2048} placeholder="https://www.youtube.com/watch?v=..." aria-invalid={!!errors.videoUrl} {...register("videoUrl")}/>{errors.videoUrl && <span className="admin-field__error">{errors.videoUrl.message}</span>}<small>Use a publicly embeddable YouTube/Vimeo link or direct video URL.</small></div>
                <div className="admin-field"><label htmlFor="lecture-order">Display order <b>*</b></label><input id="lecture-order" type="number" step="1" min="0" aria-invalid={!!errors.order} {...register("order", { valueAsNumber: true })}/>{errors.order && <span className="admin-field__error">{errors.order.message}</span>}</div>
                {actionError && <div className="admin-alert admin-alert--error" role="alert">{actionError}</div>}
                <button type="submit" className="admin-btn admin-btn--primary admin-lecture-editor__submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : editing ? "Save lecture changes" : "Add lecture"}<Plus size={17}/></button>
                {editing && <button type="button" className="admin-btn admin-btn--outline admin-lecture-editor__cancel" onClick={resetEditor}>Cancel editing</button>}
              </form>
            </section>
          </div>
        </>
      )}
      {deleteTarget && <ConfirmDialog title="Delete this lecture?" description={`“${deleteTarget.title}” will be permanently removed from this course.`} busy={deleting} error={actionError} onCancel={() => { setDeleteTarget(null); setActionError(""); }} onConfirm={() => void confirmDelete()}/>}
    </main>
  );
}
