import LottieView from "lottie-react-native";

const Example = () => {
  return (
    <LottieView
      source={require("./jsonAnim/groovyWalk.json")}
      style={{ width: 100, height: 100 }}
      autoPlay
      loop
    />
  );
};

export default Example;