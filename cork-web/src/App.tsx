import TodoList from "./components/TodoWidget/TodoList";

function App() {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <TodoList />
        </div>
      </div>
    </main>
  );
}

export default App;
