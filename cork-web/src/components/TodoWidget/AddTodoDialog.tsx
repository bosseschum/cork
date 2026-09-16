function AddTodoDialog({
  handleSubmit,
  todoText,
  handleInputChange,
  dialogRef,
  setIsDialogOpen,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  todoText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  setIsDialogOpen: (open: boolean) => void;
}) {
  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="btn btn-primary mt-3"
      >
        New Task
      </button>
      <dialog ref={dialogRef} className="dialog border border-0 shadow rounded">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="todo-input"
            className="form-control"
            placeholder="Enter a new task"
            value={todoText}
            onChange={handleInputChange}
          />
          <div className="d-flex mt-2 gap-1">
            <button type="submit" className="btn btn-primary mt-2">
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="btn btn-secondary mt-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export default AddTodoDialog;
