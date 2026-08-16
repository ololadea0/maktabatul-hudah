import env from './env.js';
import AppError from '../utils/appError.js';

const getSupabaseConfig = () => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new AppError('Supabase storage is not configured', 500);
  }

  return {
    baseUrl: env.supabaseUrl.replace(/\/$/, ''),
    serviceRoleKey: env.supabaseServiceRoleKey,
    bucket: env.supabaseStorageBucket,
    signedUrlExpiresIn: env.supabaseSignedUrlExpiresIn,
  };
};

const encodeObjectPath = (path) =>
  path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const getHeaders = (serviceRoleKey, extraHeaders = {}) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  ...extraHeaders,
});

export const uploadObject = async ({ path, buffer, contentType }) => {
  const { baseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
    {
      method: 'POST',
      headers: getHeaders(serviceRoleKey, {
        'Content-Type': contentType,
        'x-upsert': 'true',
      }),
      body: buffer,
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new AppError(message || 'Failed to upload PDF to Supabase', 502);
  }

  return {
    path,
  };
};

export const downloadObject = async (path) => {
  const { baseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
    {
      method: 'GET',
      headers: getHeaders(serviceRoleKey),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new AppError(message || 'Failed to download object from Supabase', 502);
  }

  return Buffer.from(await response.arrayBuffer());
};

export const getObjectMetadata = async (path) => {
  const { baseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
    {
      method: 'HEAD',
      headers: getHeaders(serviceRoleKey),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new AppError(message || 'Failed to read object metadata from Supabase', 502);
  }

  return {
    contentLength: Number(response.headers.get('content-length')) || null,
    contentType: response.headers.get('content-type') || 'application/pdf',
    etag: response.headers.get('etag'),
    lastModified: response.headers.get('last-modified'),
  };
};

export const fetchObjectRange = async ({ path, range }) => {
  const { baseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${encodeObjectPath(path)}`,
    {
      method: 'GET',
      headers: getHeaders(serviceRoleKey, {
        Range: range,
      }),
    },
  );

  if (!response.ok && response.status !== 206) {
    const message = await response.text();
    throw new AppError(message || 'Failed to stream object from Supabase', 502);
  }

  return response;
};

export const createSignedObjectUrl = async (path) => {
  if (!path) {
    return null;
  }

  const { baseUrl, serviceRoleKey, bucket, signedUrlExpiresIn } =
    getSupabaseConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/sign/${bucket}/${encodeObjectPath(path)}`,
    {
      method: 'POST',
      headers: getHeaders(serviceRoleKey, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        expiresIn: signedUrlExpiresIn,
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new AppError(message || 'Failed to create signed PDF URL', 502);
  }

  const data = await response.json();
  const signedUrl = data.signedURL || data.signedUrl;

  if (!signedUrl) {
    throw new AppError('Supabase did not return a signed PDF URL', 502);
  }

  if (signedUrl.startsWith('http')) {
    return signedUrl;
  }

  return `${baseUrl}/storage/v1${signedUrl}`;
};

export const deleteObject = async (path) => {
  if (!path) {
    return;
  }

  const { baseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
  const response = await fetch(`${baseUrl}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: getHeaders(serviceRoleKey, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      prefixes: [path],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new AppError(message || 'Failed to delete PDF from Supabase', 502);
  }
};
