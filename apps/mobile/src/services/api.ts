import Constants from 'expo-constants';
import { analysisJobSchema, type AnalysisPhase, type LabelImage } from '@vera/shared';
import { resolveApiUrl } from './config';
import { getJson, postJson } from './http';
import { runAnalysisJob } from './analysis-job';
export const api = {
  classify: (image: LabelImage, onPhase: (phase: AnalysisPhase) => void) => {
    const baseUrl = resolveApiUrl({ configuredUrl: process.env.EXPO_PUBLIC_API_URL, hostUri: Constants.expoConfig?.hostUri, development: __DEV__ });
    return runAnalysisJob({
      start: () => postJson(`${baseUrl}/api/classify`, { images: [image] }, analysisJobSchema),
      poll: id => getJson(`${baseUrl}/api/jobs/${id}`, analysisJobSchema),
    }, onPhase);
  },
};
