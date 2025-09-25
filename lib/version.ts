import pkg from '../package.json';

export const appVersion: string = (pkg as any).version as string;
export const releaseChannel: string =
  process.env.NEXT_PUBLIC_RELEASE_CHANNEL ||
  (process.env.NODE_ENV === 'production' ? 'prod' : 'dev');
export const gitShaShort: string | undefined =
  process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7);

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Version Debug Info:');
  console.log('  appVersion:', appVersion);
  console.log('  releaseChannel:', releaseChannel);
  console.log('  NEXT_PUBLIC_GIT_SHA:', process.env.NEXT_PUBLIC_GIT_SHA);
  console.log('  gitShaShort:', gitShaShort);
}
