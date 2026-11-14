import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, ImageIcon, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { getPublicCourse } from "../../services/course.service";
import { createAdminCourse, getAdminErrorMessage, updateAdminCourse } from "../../services/admin.service";
import { courseFormSchema } from "../../validations/admin-forms";
import type { CourseFormValues } from "../../validations/admin-forms";

const initialValues: CourseFormValues = { title: "", description: "", price: 0, thumbnailUrl: "" };

export function AdminCourseFormPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const editing = Boolean(courseId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema), defaultValues: initialValues,
  });

  useEffect(() => {
    if (!courseId) return;
    const controller = new AbortController();
    getPublicCourse(courseId, controller.signal).then((course) => {
      if (controller.signal.aborted) return;
      reset({ title: course.title, description: course.description, price: course.price, thumbnailUrl: course.thumbnailUrl });
      setLoading(false);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setLoadError(getAdminErrorMessage(error));
      setLoading(false);
    });
    return () => controller.abort();
  }, [courseId, reset]);

  async function onSave(data: CourseFormValues) {
    setSaveError("");
    try {
      if (courseId) await updateAdminCourse(courseId, data);
      else await createAdminCourse(data);
      navigate("/admin/courses", { replace: true });
    } catch (error) { setSaveError(getAdminErrorMessage(error)); }
  }

  const preview = watch("thumbnailUrl");
  return (
    <main>
      <Link className="admin-back" to="/admin/courses"><ArrowLeft size={16}/> Back to courses</Link>
      <div className="admin-page-head"><div><span className="admin-eyebrow">COURSE MANAGEMENT / {editing ? "EDIT COURSE" : "NEW COURSE"}</span><h1>{editing ? "Refine your" : "Create a new"} <em>course.</em></h1><p>{editing ? "Update the information shown on your student pages." : "Give your course a compelling title, description, and cover image."}</p></div></div>
      {loading && <div className="admin-state" role="status">Loading course details…</div>}
      {loadError && <div className="admin-alert admin-alert--error" role="alert">{loadError} <Link to="/admin/courses">Return to courses</Link></div>}
      {!loading && !loadError && (
        <form className="admin-edit-layout" onSubmit={handleSubmit(onSave)} noValidate>
          <section className="admin-panel admin-edit-panel">
            <div className="admin-panel__header"><div><span className="admin-eyebrow">COURSE INFORMATION</span><h2>Course <em>details.</em></h2></div></div>
            <div className="admin-form admin-edit-form">
              <div className="admin-field"><label htmlFor="course-title">Course title <b>*</b></label><input id="course-title" maxLength={120} placeholder="e.g. Complete React Fundamentals" aria-invalid={!!errors.title} {...register("title")}/>{errors.title && <span className="admin-field__error">{errors.title.message}</span>}</div>
              <div className="admin-field"><label htmlFor="course-description">Description <b>*</b></label><textarea id="course-description" rows={6} maxLength={2000} placeholder="What will students learn?" aria-invalid={!!errors.description} {...register("description")}/>{errors.description && <span className="admin-field__error">{errors.description.message}</span>}</div>
              <div className="admin-field"><label htmlFor="course-price">Price (BDT) <b>*</b></label><input id="course-price" type="number" min="0" step="1" aria-invalid={!!errors.price} {...register("price", { valueAsNumber: true })}/>{errors.price && <span className="admin-field__error">{errors.price.message}</span>}</div>
              <div className="admin-field"><label htmlFor="course-image">Thumbnail URL <b>*</b></label><input id="course-image" type="url" maxLength={2048} placeholder="https://example.com/cover.jpg" aria-invalid={!!errors.thumbnailUrl} {...register("thumbnailUrl")}/>{errors.thumbnailUrl && <span className="admin-field__error">{errors.thumbnailUrl.message}</span>}</div>
              {saveError && <div className="admin-alert admin-alert--error" role="alert">{saveError}</div>}
              <div className="admin-edit-form__actions"><Link to="/admin/courses" className="admin-btn admin-btn--outline">Cancel</Link><button className="admin-btn admin-btn--primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : (editing ? "Save changes" : "Create course")}{editing ? <Save size={17}/> : <ArrowRight size={17}/>}</button></div>
            </div>
          </section>
          <aside className="admin-preview">
            <span className="admin-eyebrow">LIVE PREVIEW</span>
            <div className="admin-preview__image">{preview?.startsWith("http") ? <img src={preview} alt="Course thumbnail preview" onError={(event) => { event.currentTarget.style.display = "none"; }} onLoad={(event) => { event.currentTarget.style.display = "block"; }}/> : <ImageIcon size={33}/>}</div>
            <h3>{watch("title") || "Your course title"}</h3><p>{watch("description") || "Your course description appears here."}</p><span>{Number(watch("price")) === 0 ? "Free" : `৳${Number(watch("price") || 0).toLocaleString("en-BD")}`}</span>
          </aside>
        </form>
      )}
    </main>
  );
}
