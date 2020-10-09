import {
    SORT_BY_DATE
} from '../constants/ActionTypes';

const sortByDate = (state, payload) => {
    const { currentStatusFilter, sortValue } = payload;
    const updatedTasks = state.tasks.sort(function (a, b) {
        return sortValue === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
    }).filter(task => {
        if (currentStatusFilter === 'all') {
            return task.status !== 'deleted';
        } else {
            return task.status === currentStatusFilter;
        }
    });
    return {
        ...state,
        filteredTasks: [...updatedTasks]
    }
}

export function sortDateReducer(state, action) {
    switch (action.type) {

        case SORT_BY_DATE: {
            return sortByDate(state, action.payload)
        }
        default:
            return state;
    }
}