import Game from "./components/game";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
};

export default App;
