import TodoList from "./components/TodoWidget/TodoList";
import Weather from "./components/WeatherWidget/Weather";

function App() {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <TodoList />
        </div>
        <div className="col-12 col-md-8 col-lg-6">
          <Weather />
        </div>
      </div>
    </main>
  );
}

export default App;
