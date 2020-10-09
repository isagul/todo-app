import React, { useReducer, createContext } from 'react';
import rootReducer from './reducers/index';

export const Store = createContext();

const initialState = {
    tasks: [],
    filteredTasks: [],
    recentlyDeleted: [],
    loading: false,
    currentPage: 1,
    currentFilter: 'all'
};

export function StoreProvider(props) {
    const [state, dispatch] = useReducer(rootReducer, initialState);

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