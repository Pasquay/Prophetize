import Constants from 'expo-constants';

const RENDER_URL = 'https://prophetize.onrender.com';

const envBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim();
const expoHostUri = Constants.expoConfig?.hostUri;
const expoHost = expoHostUri?.split(':')[0];
const inferredLanBackendUrl = expoHost ? `http://${expoHost}:3001` : null;
const isDev = __DEV__ && expoHostUri;
const backendUrl = envBackendUrl
  || (isDev ? inferredLanBackendUrl : null)
  || RENDER_URL;

export default backendUrl;