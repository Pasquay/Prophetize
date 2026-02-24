import LottieView from "lottie-react-native";


const Example = () => {
  return (
    <LottieView
      source={require("./jsonAnim/logo.json")}
      style={{ width: 100, height: 100 }}
      loop = {false}
    />
  );
};

export default Example;