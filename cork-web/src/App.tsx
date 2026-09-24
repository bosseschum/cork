import Quote from "./components/Quote";
import TodoList from "./components/TodoWidget/TodoList";
import Weather from "./components/Weather";

function App() {
  return (
    <main className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <Quote />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-8">
          <TodoList />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <Weather />
        </div>
      </div>
    </main>
  );
}

export default App;
