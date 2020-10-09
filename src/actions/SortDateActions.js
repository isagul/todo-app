import { 
    SORT_BY_DATE
} from '../constants/ActionTypes';

export const sortByDate = (task, dispatch) => {
    dispatch({
        type: SORT_BY_DATE,
        payload: task,
    })
};