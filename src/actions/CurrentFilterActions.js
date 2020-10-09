import { 
    SET_CURRENT_FILTER
} from '../constants/ActionTypes';

export const setCurrentFilter = (filterValue, dispatch) => {
    dispatch({
        type: SET_CURRENT_FILTER,
        payload: filterValue,
    })
};