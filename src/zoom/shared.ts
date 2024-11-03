export type ZoomOsascriptResponse = {
  error?: { message: string; code?: number };
  video: boolean | null;
  mic: boolean | null;
};
