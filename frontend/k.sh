#!/bin/bash

# مسار مجلد app
APP_DIR="./app"

# تأكد من وجود مجلد app
if [ ! -d "$APP_DIR" ]; then
  echo "❌ Folder 'app' not found in current directory."
  exit 1
fi

echo "📂 Exploring routes inside: $APP_DIR"
echo "=============================="

# ابحث عن جميع ملفات page.*
find "$APP_DIR" -type f \( -name "page.js" -o -name "page.tsx" -o -name "page.jsx" -o -name "page.ts" \) | while read page_file; do
  # إزالة المجلد الأساسي app/
  route=${page_file#"$APP_DIR"}

  # إزالة اسم الملف النهائي /page.tsx
  route=$(dirname "$route")

  # استبدال الأقواس الديناميكية Next.js مثل [slug] بـ :slug
  route=$(echo "$route" | sed -E 's/\[(.*?)\]/:\1/g')

  # لو كان المسار فارغ (يعني route root)
  if [ "$route" == "/" ] || [ -z "$route" ]; then
    route="/"
  fi

  echo "🔹 $route"
done

echo "=============================="
echo "✅ Total Routes: $(find "$APP_DIR" -type f \( -name "page.js" -o -name "page.tsx" -o -name "page.jsx" -o -name "page.ts" \) | wc -l)"
