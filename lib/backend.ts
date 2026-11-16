import { CustomBackendClient } from './apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'credible-artisans';

export const backend = new CustomBackendClient(BACKEND_URL, APP_ID);
