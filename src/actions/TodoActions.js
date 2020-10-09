import { 
    ADD_TASK,
    SET_TASKS,
    DELETE_TASK_TEMP,
    DELETE_TASK_PERM,
    UPDATE_STATUS
} from '../constants/ActionTypes';

export const addTask = (task, dispatch) => {
    dispatch({
        type: ADD_TASK,
        payload: task,
    })
};

export const setTasks = (task, dispatch) => {
    dispatch({
        type: SET_TASKS,
        payload: task,
    })
};

export const deleteTaskTemp = (task, dispatch) => {
    dispatch({
        type: DELETE_TASK_TEMP,
        payload: task,
    })
};

export const deleteTaskPerm = (task, dispatch) => {
    dispatch({
        type: DELETE_TASK_PERM,
        payload: task,
    })
};

export const updateStatus = (task, dispatch) => {
    dispatch({
        type: UPDATE_STATUS,
        payload: task,
    })
};