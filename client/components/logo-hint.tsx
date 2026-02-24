import { Image } from 'react-native';

export function LogoHint() {
    return (
        <Image source={require('../assets/app-icons/logo_hint.png')} className="w-64 h-64" />
    );
}

export default LogoHint;