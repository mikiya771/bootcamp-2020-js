/**
 * Dispatcher
 */
class Dispatcher extends EventTarget {
  dispatch() {
    this.dispatchEvent(new CustomEvent("event"));
  }

  subscribe(subscriber) {
    this.addEventListener("event", subscriber);
  }
}

/**
 * Action Creator and Action Types
 */
const FETCH_TODO_ACTION_TYPE = "Fetch todo list from server";
export const createFetchTodoListAction = () => ({
  type: FETCH_TODO_ACTION_TYPE,
  payload: undefined,
});

const REMOVE_TODO_ACTION_TYPE = "Remove todo action from server and store"
export const  removeToDoAction = (todo)  => ({
  type: REMOVE_TODO_ACTION_TYPE,
  payload: todo,
});
const ADD_TODO_ACTION_TYPE = "A todo addition to store";
export const createAddTodoAction = (todo) => ({
  type: ADD_TODO_ACTION_TYPE,
  payload: todo,
});

const TOGGLE_TODO_ACTION_TYPE = "Toggle todo action from server and store"
export const toggleToDoAction = (payload) => ({
  type: TOGGLE_TODO_ACTION_TYPE,
  payload: payload
})
const CLEAR_ERROR = "Clear error from state";
export const clearError = () => ({
  type: CLEAR_ERROR,
  payload: undefined,
});

/**
 * Store Creator
 */
const api = "http://localhost:3000/todo";

const defaultState = {
  todoList: [],
  error: null,
};

const headers = {
  "Content-Type": "application/json; charset=utf-8",
};

const reducer = async (prevState, { type, payload }) => {
  switch (type) {
    case FETCH_TODO_ACTION_TYPE: {
      try {
        const resp = await fetch(api).then((d) => d.json());
        return { todoList: resp.todoList, error: null };
      } catch (err) {
        return { ...prevState, error: err };
      }
    }
    case ADD_TODO_ACTION_TYPE: {
      const body = JSON.stringify(payload);
      const config = { method: "POST", body, headers };
      try {
        const resp = await fetch(api, config).then((d) => d.json());
        return { todoList: [...prevState.todoList, resp], error: null };
      } catch (err) {
        return { ...prevState, error: err };
      }
    }
    case REMOVE_TODO_ACTION_TYPE: {
      const url = "http://localhost:3000/todo/" + payload
      console.log(payload)
      const config = {
        method : "DELETE",
      }
      try {
        await fetch(url, config)
        const index = prevState.todoList.findIndex(
          (todo) => todo.id === payload
        );
        if (index === -1) return;
        const nextTodoList = [...prevState.todoList];
        nextTodoList.splice(index, 1);
        return { todoList: nextTodoList, error: null }; 
      } catch (err) {
        console.log('err')
        return {...prevState , err}
      }
    }
    case TOGGLE_TODO_ACTION_TYPE: {
      const url = "http://localhost:3000/todo/" + payload.id
      console.log(payload.id)
      const body = JSON.stringify(payload)
      const config = {
        method: "PATCH",
        body,
        headers
      }
      try {
        await fetch(url, config)
        const index = prevState.todoList.findIndex(
          (todo) => todo.id === payload.id
        )
        if (index === -1) return;
        const nextTodoList = [...prevState.todoList]
        nextTodoList[index].done = payload.done
        return {todoList: nextTodoList, error: null}
      }catch (err){
        console.error(err)
        return {...prevState, err}
      }
    }
    case CLEAR_ERROR: {
      return { ...prevState, error: null };
    }
    default: {
      throw new Error("unexpected action type: %o", { type, payload });
    }
  }
};

export function createStore(initialState = defaultState) {
  const dispatcher = new Dispatcher();
  let state = initialState;

  const dispatch = async ({ type, payload }) => {
    console.group(type);
    console.log("prev", state);
    state = await reducer(state, { type, payload });
    console.log("next", state);
    console.groupEnd();
    dispatcher.dispatch();
  };

  const subscribe = (subscriber) => {
    dispatcher.subscribe(() => subscriber(state));
  };

  return {
    dispatch,
    subscribe,
  };
}
