import { config } from 'dotenv';
config();

import '@/ai/flows/generate-ticket-from-prompt.ts';
import '@/ai/flows/extract-variables-from-prompt.ts';