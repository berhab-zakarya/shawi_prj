import { z } from "zod"

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "العنوان مطلوب")
    .max(200, "العنوان يجب ألا يتجاوز 200 حرف"),

  content_type: z.enum(["article", "video", "infographic", "faq"], {
    errorMap: () => ({ message: "يجب اختيار نوع محتوى صالح" }),
  }),

  content: z.string().min(1, "المحتوى مطلوب"),

  media: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true
      return file instanceof File
    }, {
      message: "يجب أن يكون الملف من نوع صالح (صورة أو فيديو)",
    })
    .refine((file) => {
      if (!file) return true
      return (
        file.type.startsWith("image/") || file.type.startsWith("video/")
      )
    }, {
      message: "يجب أن يكون الملف صورة أو فيديو",
    }),

  tags: z.array(z.string()).optional(),

  meta_title: z
    .string()
    .max(60, "عنوان SEO يجب ألا يتجاوز 60 حرف")
    .optional(),

  meta_description: z
    .string()
    .max(160, "وصف SEO يجب ألا يتجاوز 160 حرف")
    .optional(),

  is_featured: z.boolean().optional(),
})
.refine((data) => {
  const { content_type, media } = data
  if (
    (content_type === "video" || content_type === "infographic") &&
    !media
  ) {
    return false
  }
  return true
}, {
  message: "الوسائط مطلوبة للفيديو أو الإنفوجرافيك",
  path: ["media"],
})

export type PostFormData = z.infer<typeof postSchema>
