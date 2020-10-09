import {
    ADD_TASK,
    SET_TASKS,
    UPDATE_STATUS,
    DELETE_TASK_PERM,
    DELETE_TASK_TEMP
} from '../constants/ActionTypes';

const patchTasks = (state, payload) => {
    const { data } = payload;
    return {
        ...state,
        tasks: [...state.tasks, ...data],
        filteredTasks: [...state.filteredTasks, ...data],
    }
}

const addTask = (state, payload) => {
    const { task, currentStatusFilter } = payload;
    state.tasks.push(task);
    state.filteredTasks.push(task);

    const updatedTasks = currentStatusFilter === 'all' ? state.tasks.filter(task => task.status !== 'deleted') :
        state.tasks.filter(task => task.status === currentStatusFilter);
    return {
        ...state,
        filteredTasks: [...updatedTasks]
    }
}

const deleteTaskTemporary = (state, payload) => {
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
        filteredTasks: [...updatedTasks],
        tasks: [...data]
    }
}

const deleteTaskPermanent = (state, payload) => {
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
        filteredTasks: [...updatedTasks],
        tasks: [...data]
    }
}

const updateTaskStatus = (state, payload) => {
    const { data, currentStatusFilter } = payload;
    const updatedTasks = data.filter(task => {
        if (currentStatusFilter === 'all') {
            return task.status !== 'deleted';
        } else {
            return task.status === currentStatusFilter;
        }
    });
    return {
        ...state,
        filteredTasks: [...updatedTasks],
        tasks: [...data]
    }
}

export function todoReducer(state, action) {
    switch (action.type) {

        case ADD_TASK: {
            return addTask(state, action.payload)
        }

        case UPDATE_STATUS: {
            return updateTaskStatus(state, action.payload)
        }

        case DELETE_TASK_PERM: {
            return deleteTaskPermanent(state, action.payload)
        }

        case DELETE_TASK_TEMP: {
            return deleteTaskTemporary(state, action.payload)
        }

        case SET_TASKS: {
            return patchTasks(state, action.payload)
        }
        default:
            return state;
    }
}