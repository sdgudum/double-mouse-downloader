export function makeChannelName(featureName: string, apiName: string): string {
  return `${featureName}:${apiName}`;
}
