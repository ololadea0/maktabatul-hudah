import asyncHandler from '../middleware/asyncHandler.js';
import * as subscriberService from '../services/subscriberService.js';
import { successResponse } from '../utils/apiResponse.js';

export const subscribe = asyncHandler(async (req, res) => {
  await subscriberService.subscribe(req.body);

  return successResponse(res, 201, 'You have successfully subscribed.');
});

export const unsubscribe = asyncHandler(async (req, res) => {
  await subscriberService.unsubscribeByToken(req.query.token);

  return res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Unsubscribed - Maktabatul Huda</title>
  </head>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f8f5f0;font-family:Arial,Helvetica,sans-serif;color:#14532d;">
    <main style="max-width:520px;margin:24px;padding:32px;background:#fff;border:1px solid #e5eee8;border-radius:12px;text-align:center;">
      <h1 style="margin:0 0 12px;font-size:26px;">You have been unsubscribed</h1>
      <p style="margin:0;line-height:1.6;color:#4b5563;">You have been unsubscribed from Maktabatul Huda emails.</p>
    </main>
  </body>
</html>`);
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const result = await subscriberService.listSubscribers(req.query);

  return successResponse(res, 200, 'Subscribers retrieved successfully', result);
});
