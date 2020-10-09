import {
    GET_FILTER_TASKS
} from '../constants/ActionTypes';

const filterTasks = (state, payload) => {
    const { data, currentStatusFilter } = payload;
    const updatedTasks = data.filter(task => {
        if (currentStatusFilter === 'all') {
            return task;
        } else {
            return task.status === currentStatusFilter;
        }
    });
    return {
        ...state,
        filteredTasks: [...updatedTasks]
    }
}

export function filterTaskReducer(state, action) {
    switch (action.type) {

        case GET_FILTER_TASKS: {
            return filterTasks(state, action.payload)
        }
        default:
            return state;
    }
}