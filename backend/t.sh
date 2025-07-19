#!/bin/bash

# مجلد المشروع الأساسي
ROOT_DIR=$(pwd)

# مجلد الوجهة لحفظ الملفات المنسوخة
DEST_DIR="$ROOT_DIR/copied_files"

# قائمة الملفات المطلوبة فقط
FILES_TO_COPY=("models.py" "tasks.py" "urls.py" "views.py" "serializers.py")

# إنشاء مجلد الوجهة إن لم يكن موجودًا
mkdir -p "$DEST_DIR"

# البحث عن التطبيقات متجاهلين مجلد .venv
find . \( -path "*/.venv/*" -o -path "*/venv/*" \) -prune -o -type f -name "apps.py" -print | sed 's|/apps.py||' | while read -r app_path; do
    app_name=$(basename "$app_path")
    echo "🔍 التطبيق: $app_name"

    for file_name in "${FILES_TO_COPY[@]}"; do
        src_file="$app_path/$file_name"
        if [[ -f "$src_file" ]]; then
            dest_file="$DEST_DIR/${app_name}_${file_name}"
            cp "$src_file" "$dest_file"
            echo "✅ تم نسخ: $src_file → $dest_file"
        else
            echo "⚠️ لا يوجد: $src_file"
        fi
    done
done

echo "🏁 العملية تمت بنجاح، وكل مجلدات venv تم تجاهلها، طاعةً لأمركم يا أمير المؤمنين."