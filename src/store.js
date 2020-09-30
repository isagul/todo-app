import React from 'react';
import { 
    ADD_TASK, 
    UPDATE_STATUS, 
    GET_FILTER_TASKS, 
    DELETE_TASK, 
    SORT_BY_DATE, 
    UNDO_TASK, 
    SET_TASKS,
    UPDATE_STATUS_API,
    GET_FILTER_TASKS_API,
    DELETE_TASK_PERM_API,
    DELETE_TASK_TEMP_API
} from './actions/index';

export const Store = React.createContext();

const initialState = {
    tasks: [],
    filteredTasks: [],
    recentlyDeleted: []
};

function reducer(state, action) {
    switch (action.type) {

         /* before backend */
         
        case ADD_TASK: {
            const { currentStatusFilter, task } = action.payload;
            state.tasks.push(task);
            state.filteredTasks.push(task);

            const updatedTasks = currentStatusFilter === 'all' ? state.tasks.filter(task => task.status !== 'deleted') : 
            state.tasks.filter(task => task.status === currentStatusFilter);
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
            } else if (action.payload.key === 'recently_deleted'){
                return {
                    ...state,
                    filteredTasks: [...state.recentlyDeleted]
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
            const deletedTask = state.tasks.splice(idx, 1);
            state.recentlyDeleted = [...state.recentlyDeleted, ...deletedTask];
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
        case UNDO_TASK: {
            const {id} = action.payload;
            const idx = state.recentlyDeleted.findIndex(task => task.id === id);
            const undoTask = state.recentlyDeleted.splice(idx, 1);
            state.tasks = [...state.tasks, ...undoTask]; 
            return {
                ...state,
                tasks: [...state.tasks],
                filteredTasks: [...state.recentlyDeleted]
            } 
        }

        /* after backend */

        case SET_TASKS: {
            return {
                ...state,
                tasks: [...state.tasks, ...action.payload],
                filteredTasks: [...state.filteredTasks, ...action.payload],
            }
        }

        case UPDATE_STATUS_API: {
            const updatedTasks = action.payload.data.filter(task => {
                if (action.payload.currentStatusFilter === 'all') {
                    return task.status !== 'deleted';
                } else {
                    return task.status === action.payload.currentStatusFilter;
                }
            });
            return {
                ...state,
                filteredTasks: [...updatedTasks],
                tasks: [...action.payload.data]
            }
        }
        
        case GET_FILTER_TASKS_API: {
            const updatedTasks = action.payload.data.filter(task => {
                if (action.payload.currentStatusFilter === 'all') {
                    return task;
                } else {
                    return task.status === action.payload.currentStatusFilter;
                }
            });
            return {
                ...state,
                filteredTasks: [...updatedTasks]
            }
        }

        case DELETE_TASK_PERM_API: {
            const updatedTasks = action.payload.data.filter(task => {
                if (action.payload.currentStatusFilter === 'all') {
                    return task;
                } else {
                    return task.status === action.payload.currentStatusFilter;
                }
            });
            return {
                ...state,
                filteredTasks: [...updatedTasks],
                tasks: [...action.payload.data]
            }
        }

        case DELETE_TASK_TEMP_API: {
            const updatedTasks = action.payload.data.filter(task => {
                if (action.payload.currentStatusFilter === 'all') {
                    return task;
                } else {
                    return task.status === action.payload.currentStatusFilter;
                }
            });
            return {
                ...state,
                filteredTasks: [...updatedTasks],
                tasks: [...action.payload.data]
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