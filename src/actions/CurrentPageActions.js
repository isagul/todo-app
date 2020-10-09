import { 
    SET_CURRENT_PAGE
} from '../constants/ActionTypes';

export const setCurrentPage = (status, dispatch) => {
    dispatch({
        type: SET_CURRENT_PAGE,
        payload: status,
    })
};