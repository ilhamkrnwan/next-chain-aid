# 🗄️ Panduan Setup Supabase Storage

## 📋 Langkah-Langkah Setup

### 1. Buat Buckets di Supabase Dashboard

Buka **Supabase Dashboard** → **Storage** → **Create Bucket**

#### Bucket 1: `documents` (Private)

- Name: `documents`
- Public: **NO** (unchecked)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png,application/pdf`

#### Bucket 2: `campaigns` (Public)

- Name: `campaigns`
- Public: **YES** (checked)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png,image/jpg,image/webp`

#### Bucket 3: `avatars` (Public)

- Name: `avatars`
- Public: **YES** (checked)
- File size limit: 2 MB
- Allowed MIME types: `image/jpeg,image/png,image/jpg,image/webp`

---

### 2. Setup RLS Policies

#### Opsi A: Via SQL Editor (Recommended)

1. Buka **SQL Editor** di Supabase Dashboard
2. Copy-paste isi file `migrations/002_storage_policies.sql`
3. Klik **Run**
4. ✅ Verify policies created

#### Opsi B: Via Dashboard UI

Untuk setiap bucket, buka **Policies** tab dan tambahkan policies sesuai dengan yang ada di `002_storage_policies.sql`.

---

### 3. Verify Setup

Jalankan query ini di SQL Editor:

```sql
-- Check buckets
SELECT * FROM storage.buckets;

-- Check policies for documents
SELECT * FROM storage.policies WHERE bucket_id = 'documents';

-- Check policies for campaigns
SELECT * FROM storage.policies WHERE bucket_id = 'campaigns';

-- Check policies for avatars
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

**Expected Results:**

- 3 buckets created
- Multiple policies for each bucket
- documents bucket is private
- campaigns & avatars buckets are public

---

### 4. Test Upload

Setelah setup selesai, test upload dengan:

1. **Register Organization**

   - Upload KTP → Should work ✅
   - Upload Legal Doc → Should work ✅

2. **Create Campaign** (as org)

   - Upload campaign image → Should work ✅

3. **Update Profile**
   - Upload avatar → Should work ✅

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"

**Penyebab**: RLS policies belum di-setup atau salah konfigurasi

**Solusi**:

1. Pastikan buckets sudah dibuat
2. Jalankan SQL dari `002_storage_policies.sql`
3. Verify policies dengan query di atas

### Error: "Bucket not found"

**Penyebab**: Bucket belum dibuat

**Solusi**:

1. Buat bucket di Dashboard → Storage
2. Pastikan nama bucket sesuai: `documents`, `campaigns`, `avatars`

### Error: "File size too large"

**Penyebab**: File melebihi size limit

**Solusi**:

1. Compress image/file
2. Atau increase bucket size limit di Dashboard

---

## 📁 Folder Structure

```
storage/
├── documents/          (private bucket)
│   ├── ktp/
│   │   └── {user_id}/
│   │       └── filename.pdf
│   └── legal/
│       └── {user_id}/
│           └── filename.pdf
├── campaigns/          (public bucket)
│   └── {user_id}-{timestamp}.jpg
└── avatars/            (public bucket)
    └── {user_id}/
        └── filename.jpg
```

---

## ✅ Checklist

- [ ] Bucket `documents` created (private)
- [ ] Bucket `campaigns` created (public)
- [ ] Bucket `avatars` created (public)
- [ ] RLS policies applied
- [ ] Policies verified via SQL
- [ ] Test upload KTP berhasil
- [ ] Test upload campaign image berhasil
- [ ] Ready to use! 🎉

---

**Setelah semua checklist ✅, aplikasi siap untuk upload files!**
