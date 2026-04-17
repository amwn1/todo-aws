import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://aizb37fn07.execute-api.ap-south-1.amazonaws.com/dev";

function App() {
  const auth = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (auth.isAuthenticated) loadTodos();
  }, [auth.isAuthenticated]);

  const loadTodos = async () => {
    const userID = auth.user.profile.sub;
    try {
      const res = await fetch(`${API_BASE}/todos?userID=${userID}`);
      const data = await res.json();
      setTodos(data.todos || []);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const userID = auth.user.profile.sub;
    try {
      await fetch(`${API_BASE}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, title: newTodo.trim(), description: "" })
      });
      setNewTodo("");
      loadTodos();
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const deleteTodo = async (todoID) => {
    const userID = auth.user.profile.sub;
    await fetch(`${API_BASE}/todos/${todoID}?userID=${userID}`, { method: "DELETE" });
    loadTodos();
  };

  const toggleDone = async (todo) => {
    const userID = auth.user.profile.sub;
    await fetch(`${API_BASE}/todos/${todo.todoID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID, title: todo.title, description: todo.description, done: !todo.done })
    });
    loadTodos();
  };

  const filtered = todos.filter(t =>
    filter === "All" ? true : filter === "Todo" ? !t.done : t.done
  );

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div className="app">
        <h1>Todo App</h1>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
          {auth.user.profile.email}
        </p>

        <div className="add-section">
          <input
            className="input"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button className="btn primary" onClick={addTodo}>Add</button>
        </div>

        <div className="filters">
          {["All", "Todo", "Done"].map(f => (
            <button
              key={f}
              className={`btn filter ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>

        <ul className="todo-list">
          {filtered.length === 0 && <p className="empty">No tasks here yet</p>}
          {filtered.map(todo => (
            <li key={todo.todoID} className={`todo-item ${todo.done ? "completed" : ""}`}>
              <div className="left">
                <input type="checkbox" checked={todo.done} onChange={() => toggleDone(todo)} />
                <span className="text">{todo.title}</span>
              </div>
              <button className="btn danger" onClick={() => deleteTodo(todo.todoID)}>✕</button>
            </li>
          ))}
        </ul>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button className="btn" onClick={() => auth.signoutRedirect()}>Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Todo App</h1>
      <div style={{ textAlign: "center" }}>
        <button className="btn primary" onClick={() => auth.signinRedirect()}>Sign In</button>
      </div>
    </div>
  );
}

export default App;
