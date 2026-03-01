import { Image } from 'react-native';

export function LogoHint() {
    return (
        <Image source={require('../assets/app-icons/logo_hint.png')}  style={{ width: 72, height: 72}} resizeMode="contain" />
    );
}

export default LogoHint;