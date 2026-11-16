import { CustomBackendClient } from './apiClient';

const BACKEND_URL = import.process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const APP_ID = import.process.env.NEXT_PUBLIC_APP_ID || 'my-default-app';

export const backend = new CustomBackendClient(BACKEND_URL, APP_ID);
