#!/usr/bin/env python3
"""Deploy static files to Aliyun OSS and enable static website hosting."""
import os
import mimetypes
import oss2

ACCESS_KEY_ID = os.environ.get('OSS_ACCESS_KEY_ID', '')
ACCESS_KEY_SECRET = os.environ.get('OSS_ACCESS_KEY_SECRET', '')
ENDPOINT = 'https://oss-cn-beijing.aliyuncs.com'
BUCKET_NAME = 'official-doc-writer'
OUT_DIR = os.path.join(os.path.dirname(__file__), 'out')

auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)

# Enable static website hosting
print('Enabling static website hosting...')
bucket.put_bucket_website(oss2.models.BucketWebsite('index.html', '404.html'))
print('Static website hosting enabled.')

# Upload all files from out/
def guess_content_type(filepath):
    ct, _ = mimetypes.guess_type(filepath)
    if ct:
        return ct
    ext = os.path.splitext(filepath)[1].lower()
    extra = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ttf': 'font/ttf',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain',
    }
    return extra.get(ext, 'application/octet-stream')

count = 0
for root, dirs, files in os.walk(OUT_DIR):
    for fname in files:
        local_path = os.path.join(root, fname)
        oss_key = os.path.relpath(local_path, OUT_DIR)
        content_type = guess_content_type(local_path)
        headers = {'Content-Type': content_type}
        if content_type in ('text/html', 'text/css', 'application/javascript', 'application/json'):
            headers['Content-Type'] = content_type + '; charset=utf-8'
        bucket.put_object_from_file(oss_key, local_path, headers=headers)
        count += 1
        print(f'  Uploaded: {oss_key}')

print(f'\nDone! {count} files uploaded.')
print(f'\nYour website URL:')
print(f'  http://{BUCKET_NAME}.oss-cn-beijing.aliyuncs.com/index.html')
print(f'  (Static website endpoint: http://{BUCKET_NAME}.oss-cn-beijing-internal.aliyuncs.com)')
