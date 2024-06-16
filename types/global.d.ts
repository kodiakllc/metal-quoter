import asyncStorage from '@/utils/app/async-storage';

declare global {
  interface Window {
    asyncStorage: typeof asyncStorage;
  }
}
