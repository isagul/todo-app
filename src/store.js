import React from 'react';
import { ADD_TASK, UPDATE_STATUS, GET_FILTER_TASKS, DELETE_TASK } from './constants/actions';

export const Store = React.createContext();

const initialState = {
    tasks: [
        {
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
        },
    ],
    filteredTasks: [
        {
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
        },
    ]
};

function reducer(state, action) {
    switch (action.type) {      
        case ADD_TASK:
            return {...state, tasks: [...state.tasks, action.payload], filteredTasks: [...state.filteredTasks, action.payload]}        
        case UPDATE_STATUS:
            const task = state.tasks.find(task => task.id === action.payload.id);
            if (action.payload.value) {
                task.status = 'completed';
            } else {
                task.status = 'active';
            }
            return {
                ...state, 
                filteredTasks: [...state.tasks]
            }
        case GET_FILTER_TASKS: 
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
        case DELETE_TASK: {
            // const updatedTasks = [...state.tasks];
            const idx = state.tasks.findIndex(task => task.id === action.payload);
            state.tasks.splice(idx, 1);
            return {
                ...state, 
                filteredTasks: [...state.tasks]
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