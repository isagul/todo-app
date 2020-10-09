import { 
    GET_FILTER_TASKS
} from '../constants/ActionTypes';

export const filterTasks = (task, dispatch) => {
    dispatch({
        type: GET_FILTER_TASKS,
        payload: task,
    })
};