import React from 'react';
import { ADD_TASK, UPDATE_STATUS, GET_FILTER_TASKS, DELETE_TASK, SORT_BY_DATE } from './actions/index';

export const Store = React.createContext();

const initialState = {
    tasks: [
        /* {
            id: 1,
            content: 'task 1',
            status: 'active'
        },
        {
            id: 2,
            content: 'task 2',
            status: 'active'
        },
        {
            id: 3,
            content: 'task 3',
            status: 'active'
        }, */
    ],
    filteredTasks: [
        /* {
            id: 1,
            content: 'task 1',
            status: 'active'
        },
        {
            id: 2,
            content: 'task 2',
            status: 'active'
        },
        {
            id: 3,
            content: 'task 3',
            status: 'active'
        }, */
    ]
};

function reducer(state, action) {
    switch (action.type) {
        case ADD_TASK: {
            const { currentStatusFilter, task } = action.payload;
            state.tasks.push(task);
            state.filteredTasks.push(task);
            const updatedTasks = state.tasks.filter(task => {
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

        case UPDATE_STATUS: {
            const { currentStatusFilter, task } = action.payload;
            const updatedTasks = state.tasks.map(item => {
                if (item.id === task.id) {
                    if (action.payload.value) {
                        item.status = 'completed';
                    } else {
                        item.status = 'active';
                    }
                    return item;
                }
                return item;
            }).filter(task => {
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

        case GET_FILTER_TASKS: {
            if (action.payload.key === 'all') {
                return {
                    ...state,
                    filteredTasks: [...state.tasks]
                }
            } else {
                const updatedTasks = state.tasks.filter(task => task.status === action.payload.key);
                return {
                    ...state,
                    filteredTasks: [...updatedTasks]
                }
            }
        }

        case DELETE_TASK: {
            const { task, currentStatusFilter } = action.payload
            const idx = state.tasks.findIndex(item => item.id === task.id);
            state.tasks.splice(idx, 1);
            const updatedTasks = state.tasks.filter(task => {
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
        case SORT_BY_DATE: {
            const {currentStatusFilter, sortValue} = action.payload;
            const updatedTasks = state.tasks.sort(function(a,b){
                return sortValue === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
            }).filter(task => {
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
        default:
            return state;
    }
}

export function StoreProvider(props) {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    const value = {
        state,
        dispatch
    }

    return (
        <Store.Provider value={value}>
            {props.children}
        </Store.Provider>
    )
}