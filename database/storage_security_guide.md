# ストレージセキュリティ実装ガイド

## 📅 実装日: 2025年9月25日

## 1. 概要

画像アップロードとファイルストレージの完全なセキュリティシステムを実装しました：
- **ファイルサイズ制限**
- **MIMEタイプ検証**
- **拡張子チェック**
- **ユーザー別容量制限**
- **ウイルススキャン対応**
- **使用状況追跡**

## 2. ファイルタイプ別制限

### 設定済み制限値

| タイプ | 最大サイズ | ファイル数/ユーザー | 容量/ユーザー | 公開設定 |
|--------|-----------|-------------------|--------------|---------|
| アバター | 2MB | 5 | 10MB | 公開可 |
| 投稿画像 | 5MB | 500 | 500MB | 公開可 |
| ジム画像 | 10MB | 50 | 200MB | 公開可 |
| ドキュメント | 10MB | 100 | 100MB | 非公開 |
| その他 | 1MB | 50 | 50MB | 非公開 |

### 許可されるMIMEタイプ（デフォルト）
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

## 3. アップロード前の検証

### TypeScript実装例

```typescript
// utils/storage-validation.ts
import { supabase } from '@/lib/supabase';

interface ValidationResult {
  valid: boolean;
  error?: string;
  requireVirusScan?: boolean;
  allowPublicAccess?: boolean;
  remainingFiles?: number;
  remainingStorageMb?: number;
}

export async function validateFileUpload(
  file: File,
  uploadType: 'avatar' | 'post_image' | 'gym_image' | 'document' | 'other'
): Promise<ValidationResult> {
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    return { valid: false, error: 'User not authenticated' };
  }

  // データベースで検証
  const { data, error } = await supabase.rpc('validate_file_upload', {
    p_user_id: userId,
    p_file_name: file.name,
    p_file_size_bytes: file.size,
    p_mime_type: file.type,
    p_upload_type: uploadType
  });

  if (error) {
    return { valid: false, error: error.message };
  }

  return data as ValidationResult;
}
```

## 4. セキュアなアップロード処理

```typescript
// components/SecureFileUpload.tsx
import { useState } from 'react';
import { validateFileUpload } from '@/utils/storage-validation';
import { supabase } from '@/lib/supabase';

export function SecureFileUpload({
  uploadType,
  onSuccess
}: {
  uploadType: string;
  onSuccess: (fileId: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. クライアント側の基本チェック
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('File size exceeds 10MB limit');
      }

      // 2. データベースで詳細検証
      const validation = await validateFileUpload(file, uploadType);
      if (!validation.valid) {
        throw new Error(validation.error || 'File validation failed');
      }

      // 3. セキュリティチェック
      const { data: securityCheck } = await supabase.rpc('check_file_security', {
        p_file_name: file.name,
        p_mime_type: file.type
      });

      if (!securityCheck.safe) {
        throw new Error(securityCheck.error || 'Security check failed');
      }

      // 4. ストレージにアップロード
      const fileName = `${uploadType}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 5. アップロード記録を保存
      const { data: fileRecord } = await supabase.rpc('record_file_upload', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_bucket_name: 'uploads',
        p_file_path: uploadData.path,
        p_file_name: file.name,
        p_file_size_bytes: file.size,
        p_mime_type: file.type,
        p_upload_type: uploadType,
        p_is_public: validation.allowPublicAccess || false
      });

      onSuccess(fileRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {error && <p className="text-red-500">{error}</p>}
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

## 5. ストレージ使用状況の確認

```typescript
// hooks/useStorageUsage.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface StorageUsage {
  totalFiles: number;
  totalStorageMb: number;
  avatarCount: number;
  avatarMb: number;
  postImageCount: number;
  postImageMb: number;
  // ... 他のタイプ
}

export function useStorageUsage() {
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('user_storage_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setUsage({
          totalFiles: data.total_files_count,
          totalStorageMb: data.total_storage_bytes / 1048576,
          avatarCount: data.avatar_count,
          avatarMb: data.avatar_bytes / 1048576,
          postImageCount: data.post_image_count,
          postImageMb: data.post_image_bytes / 1048576,
        });
      }
    }

    fetchUsage();
  }, []);

  return usage;
}
```

## 6. ファイル削除処理

```typescript
// utils/file-deletion.ts
export async function deleteFile(fileId: string, hardDelete = false) {
  const { data, error } = await supabase.rpc('record_file_deletion', {
    p_file_id: fileId,
    p_hard_delete: hardDelete
  });

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  // 実際のストレージからも削除
  if (hardDelete && data) {
    const { data: fileData } = await supabase
      .from('file_uploads')
      .select('file_path, bucket_name')
      .eq('id', fileId)
      .single();

    if (fileData) {
      await supabase.storage
        .from(fileData.bucket_name)
        .remove([fileData.file_path]);
    }
  }

  return data;
}
```

## 7. Supabase Storage Policyの設定

Supabaseダッシュボードで以下のポリシーを設定：

```sql
-- アバター画像バケット
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 投稿画像バケット
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- ユーザーは自分のファイルのみ削除可能
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 8. セキュリティベストプラクティス

### 必須実装項目

1. **Content-Type検証**
   ```typescript
   // ファイルの実際の内容を検証
   const actualType = await detectFileType(file);
   if (actualType !== file.type) {
     throw new Error('File type mismatch detected');
   }
   ```

2. **ファイル名のサニタイズ**
   ```typescript
   function sanitizeFileName(fileName: string): string {
     return fileName
       .replace(/[^a-zA-Z0-9.-]/g, '_')
       .replace(/\.{2,}/g, '_')
       .substring(0, 255);
   }
   ```

3. **アップロードレート制限**
   ```typescript
   // 1分間に5ファイルまで
   const canUpload = await checkRateLimit(userId, 'file_upload', 5, 60);
   if (!canUpload) {
     throw new Error('Upload rate limit exceeded');
   }
   ```

4. **画像のメタデータ削除**
   ```typescript
   // EXIFデータなどの個人情報を削除
   import { removeExif } from '@/utils/image-processing';

   if (file.type.startsWith('image/')) {
     file = await removeExif(file);
   }
   ```

## 9. ウイルススキャン統合（本番環境）

```typescript
// 外部APIサービス（ClamAV, VirusTotal等）との統合例
async function scanFileForVirus(file: File): Promise<boolean> {
  // VirusTotalなどのAPIを使用
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    headers: {
      'x-apikey': process.env.VIRUS_TOTAL_API_KEY
    },
    body: formData
  });

  const result = await response.json();

  // データベースに結果を記録
  await supabase
    .from('file_uploads')
    .update({
      virus_scan_status: result.safe ? 'clean' : 'infected'
    })
    .eq('id', fileId);

  return result.safe;
}
```

## 10. モニタリングとアラート

### ストレージ使用状況の監視
```sql
-- 容量超過が近いユーザー
SELECT
    user_id,
    total_storage_bytes / 1048576.0 as storage_mb,
    total_files_count
FROM user_storage_usage
WHERE total_storage_bytes > (
    SELECT max_storage_per_user_mb * 1048576 * 0.8
    FROM storage_limits
    WHERE resource_type = 'post_image'
)
ORDER BY total_storage_bytes DESC;
```

### 不審なアップロードの検出
```sql
-- 短時間に大量アップロード
SELECT
    user_id,
    COUNT(*) as upload_count,
    SUM(file_size_bytes) / 1048576.0 as total_mb
FROM file_uploads
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 20
ORDER BY upload_count DESC;
```

## 11. クリーンアップ処理

```sql
-- 30日以上前の削除済みファイルを物理削除
DELETE FROM file_uploads
WHERE deleted_at IS NOT NULL
AND deleted_at < NOW() - INTERVAL '30 days';

-- 孤立したファイル（ユーザー削除済み）のクリーンアップ
DELETE FROM file_uploads
WHERE user_id NOT IN (SELECT id FROM users);
```

## 重要な注意事項

⚠️ **本番環境適用前に**：
- [ ] Supabase Storageバケットの作成と設定
- [ ] Storage Policyの適用
- [ ] ウイルススキャンAPIの契約と設定
- [ ] CDN設定（画像配信の最適化）
- [ ] バックアップストレージの設定
- [ ] アラート通知の設定

これらの設定により、安全で効率的なファイルストレージシステムが実現されます。